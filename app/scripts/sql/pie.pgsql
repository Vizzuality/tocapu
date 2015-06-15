WITH rows AS (
  SELECT {{#each columns}}{{this}}{{/each}}, count({{#each columns}}{{this}}{{/each}}) as occurencies
  FROM {{table}}
  GROUP BY {{#each columns}}{{this}}{{/each}}
)

SELECT *
FROM rows
WHERE occurencies * 200 >=
(
  SELECT SUM(occurencies)
  FROM rows
)

UNION

SELECT 'Other' AS {{#each columns}}{{this}}{{/each}}, count({{#each columns}}{{this}}{{/each}})
FROM rows
WHERE occurencies * 200 <
(
  SELECT SUM(occurencies)
  FROM rows
)

