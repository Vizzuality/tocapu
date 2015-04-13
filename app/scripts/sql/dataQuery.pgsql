SELECT
  {{#each columns}}
    {{#if @last}}
      {{this}}
    {{else}}
      {{this}},
    {{/if}}
  {{/each}}
FROM {{table}}
GROUP BY {{#each columns}}{{#if @last}}{{this}}{{else}}{{this}},{{/if}}{{/each}}
