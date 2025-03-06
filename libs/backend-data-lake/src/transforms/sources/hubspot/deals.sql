SELECT
  id as Id,
  {{{temporal_fields}}},
  properties_hs_is_closed as IsClosed,
  properties_dealname as Name,
  properties_dealtype as Type,

  properties_days_to_close as DaysToClose,
  properties_hs_closed_amount as ClosedAmount,
  properties_hs_is_closed_won as IsClosedWon,
  properties_hs_closed_won_date as ClosedWonDate,
  properties_closed_won_reason as ClosedWonReason,
  properties_hs_is_closed_lost as IsClosedLost,
  properties_closed_lost_reason as ClosedLostReason,
  properties_closedate as CloseDate,

  properties_hs_forecast_amount as ForecastAmount,
  properties_hs_deal_stage_probability as DealStageProbability,

  properties_hubspot_owner_id as OwnerUserId,
  properties_hs_analytics_source as AnalyticsSource,
  properties_notes_last_contacted as LastContacted,

  createdAt as CreatedAt,
  updatedAt as LastUpdated,
  FROM {{deals}}
