SELECT {{#each columns}}{{#if @last}}{{this}}{{else}}{{this}},{{/if}}{{/each}},
COUNT (( {{#each columns}}{{#if @last}}{{this}}{{else}}{{this}},{{/if}}{{/each}} )) AS density
FROM (SELECT {{#each columns}}{{#if @last}}{{this}}{{else}}{{this}},{{/if}}{{/each}}
      FROM {{table}}) AS t
GROUP BY {{#each columns}}{{#if @last}}{{this}}{{else}}{{this}},{{/if}}{{/each}}
