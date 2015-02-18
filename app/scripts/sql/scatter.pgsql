SELECT
  {{a}},
  {{b}},
  COUNT({{a}},{{b}}) AS density
FROM <%= table %>
GROUP BY {{a}},{{b}}
