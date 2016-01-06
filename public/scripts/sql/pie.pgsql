SELECT {{#each columns}}{{this}}{{/each}},
COUNT (( {{#each columns}}{{this}}{{/each}} )) AS occurencies
FROM (SELECT {{#each columns}}{{this}}{{/each}}
      FROM {{table}}) AS t
GROUP BY {{#each columns}}{{this}}{{/each}}
