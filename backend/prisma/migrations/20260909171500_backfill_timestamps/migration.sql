-- Backfill
UPDATE "Event"
SET 
  "timezone" = 'America/Sao_Paulo',
  "startsAt" = CASE 
                 WHEN "startTime" IS NOT NULL AND "startTime" ~ '^[0-2][0-9]:[0-5][0-9]$' THEN 
                   (DATE("date") + CAST("startTime" || ':00' AS TIME)) AT TIME ZONE 'America/Sao_Paulo' AT TIME ZONE 'UTC'
                 ELSE 
                   "date"
               END,
  "endsAt" = CASE 
               WHEN "endTime" IS NOT NULL AND "endTime" ~ '^[0-2][0-9]:[0-5][0-9]$' THEN 
                 (DATE("date") + CAST("endTime" || ':00' AS TIME) + 
                   (CASE WHEN "startTime" IS NOT NULL AND "startTime" ~ '^[0-2][0-9]:[0-5][0-9]$' AND "endTime" < "startTime" THEN INTERVAL '1 day' ELSE INTERVAL '0' END)
                 ) AT TIME ZONE 'America/Sao_Paulo' AT TIME ZONE 'UTC'
               ELSE 
                 NULL 
             END;
