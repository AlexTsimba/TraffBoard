import type { PlayerDataRow, ConversionRow } from "./csv-parser";
import {
  parseCSV,
  safeParseBoolean,
  safeParseDate,
  safeParseDecimal,
  safeParseNumber,
  validatePlayerDataRow,
  validateConversionRow,
} from "./csv-parser";

export interface TransformedPlayerData {
  playerId: string;
  originalPlayerId: string;
  signUpDate: Date | undefined | null;
  firstDepositDate: Date | undefined | null;
  partnerId: string;
  companyName: string;
  // partnersEmail: REMOVED during CSV processing for data privacy
  partnerTags: string | null;
  campaignId: string;
  campaignName: string | null;
  promoId: string | null;
  promoCode: string | null;
  playerCountry: string | null;
  tagClickid: string | null;
  tagOs: string | null;
  tagSource: string | null;
  tagSub2: string | null;
  tagWebId: string | null;
  date: Date;
  prequalified: boolean;
  duplicate: boolean;
  selfExcluded: boolean;
  disabled: boolean;
  currency: string;
  ftdCount: number;
  ftdSum: number;
  depositsCount: number;
  depositsSum: number;
  cashoutsCount: number;
  cashoutsSum: number;
  casinoBetsCount: number;
  casinoRealNgr: number;
  fixedPerPlayer: number;
  casinoBetsSum: number;
  casinoWinsSum: number;
}

export interface TransformedConversionData {
  date: Date;
  foreignBrandId: string;
  foreignPartnerId: string;
  foreignCampaignId: string;
  foreignLandingId: string | null;
  trafficSource: string;
  deviceType: string;
  userAgentFamily: string | null;
  osFamily: string | null;
  country: string;
  allClicks: number;
  uniqueClicks: number;
  registrationsCount: number;
  ftdCount: number;
  depositsCount: number;
  // Conversion rate fields REMOVED during CSV processing:
  // cr, cftd, cd, rftd - these will use default values (0.00) from schema
}

export function transformPlayerData(row: PlayerDataRow): TransformedPlayerData {
  return {
    playerId: row["Player ID"],
    originalPlayerId: row["Original player ID"],
    signUpDate: safeParseDate(row["Sign up date"]),
    firstDepositDate: safeParseDate(row["First deposit date"]),
    partnerId: row["Partner ID"],
    companyName: row["Company name"],
    // partnersEmail: EXCLUDED - removed during CSV processing for privacy
    partnerTags: row["Partner tags"] || null,
    campaignId: row["Campaign ID"],
    campaignName: row["Campaign name"] || null,
    promoId: row["Promo ID"] || null,
    promoCode: row["Promo code"] || null,
    playerCountry: row["Player country"] || null,
    tagClickid: row["Tag: clickid"] || null,
    tagOs: row["Tag: os"] || null,
    tagSource: row["Tag: source"] || null,
    tagSub2: row["Tag: sub2"] || null,
    tagWebId: row["Tag: webID"] || null,
    date: safeParseDate(row.Date) ?? new Date(),
    prequalified: safeParseBoolean(row.Prequalified),
    duplicate: safeParseBoolean(row.Duplicate),
    selfExcluded: safeParseBoolean(row["Self-excluded"]),
    disabled: safeParseBoolean(row.Disabled),
    currency: row.Currency,
    ftdCount: safeParseNumber(row["FTD count"]),
    ftdSum: safeParseDecimal(row["FTD sum"]),
    depositsCount: safeParseNumber(row["Deposits count"]),
    depositsSum: safeParseDecimal(row["Deposits sum"]),
    cashoutsCount: safeParseNumber(row["Cashouts count"]),
    cashoutsSum: safeParseDecimal(row["Cashouts sum"]),
    casinoBetsCount: safeParseNumber(row["Casino bets count"]),
    casinoRealNgr: safeParseDecimal(row["Casino Real NGR"]),
    fixedPerPlayer: safeParseDecimal(row["Fixed per player"]),
    casinoBetsSum: safeParseDecimal(row["Casino bets sum"]),
    casinoWinsSum: safeParseDecimal(row["Casino wins sum"]),
  };
}

export function transformConversionData(row: ConversionRow): TransformedConversionData {
  return {
    date: safeParseDate(row.date) ?? new Date(),
    foreignBrandId: row.foreign_brand_id,
    foreignPartnerId: row.foreign_partner_id,
    foreignCampaignId: row.foreign_campaign_id,
    foreignLandingId: row.foreign_landing_id || null,
    trafficSource: row.traffic_source || "unknown", // Handle empty traffic source
    deviceType: row.device_type,
    userAgentFamily: row.user_agent_family || null,
    osFamily: row.os_family || null,
    country: row.country,
    allClicks: safeParseNumber(row.all_clicks),
    uniqueClicks: safeParseNumber(row.unique_clicks),
    registrationsCount: safeParseNumber(row.registrations_count),
    ftdCount: safeParseNumber(row.ftd_count),
    depositsCount: safeParseNumber(row.deposits_count),
    // Conversion rate fields EXCLUDED - using schema defaults (0.00):
    // cr: row.cr, cftd: row.cftd, cd: row.cd, rftd: row.rftd
  };
}

export interface DataProcessingResult<T> {
  success: boolean;
  processedCount: number;
  errorCount: number;
  errors: string[];
  data: T[];
}

export function processPlayerDataCSV(csvContent: string): DataProcessingResult<TransformedPlayerData> {
  const parseResult = parseCSV<PlayerDataRow>(csvContent);
  const errors: string[] = [...parseResult.errors];
  const validData: TransformedPlayerData[] = [];

  for (const [index, row] of parseResult.data.entries()) {
    const validationErrors = validatePlayerDataRow(row, index + 1);
    if (validationErrors.length > 0) {
      errors.push(...validationErrors);
    } else {
      try {
        const transformed = transformPlayerData(row);
        validData.push(transformed);
      } catch (error) {
        errors.push(
          `Row ${index + 1}: Transformation error - ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  return {
    success: errors.length === 0,
    processedCount: validData.length,
    errorCount: errors.length,
    errors,
    data: validData,
  };
}

export function processConversionDataCSV(csvContent: string): DataProcessingResult<TransformedConversionData> {
  const parseResult = parseCSV<ConversionRow>(csvContent);
  const errors: string[] = [...parseResult.errors];
  const validData: TransformedConversionData[] = [];

  for (const [index, row] of parseResult.data.entries()) {
    const validationErrors = validateConversionRow(row, index + 1);
    if (validationErrors.length > 0) {
      errors.push(...validationErrors);
    } else {
      try {
        const transformed = transformConversionData(row);
        validData.push(transformed);
      } catch (error) {
        errors.push(
          `Row ${index + 1}: Transformation error - ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  return {
    success: errors.length === 0,
    processedCount: validData.length,
    errorCount: errors.length,
    errors,
    data: validData,
  };
}
