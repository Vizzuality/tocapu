SELECT
  {{columnA}},
  {{columnB}},
  COUNT({{columnA}}) AS density
FROM {{table}}
GROUP BY {{columnA}},{{columnB}}
