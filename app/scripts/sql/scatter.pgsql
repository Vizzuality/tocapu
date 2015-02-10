SELECT
  <%= columnA %>,
  <%= columnB %>,
  COUNT(<%= columnA %>,<%= columnB %>) AS density
FROM <%= table %>
GROUP BY <%= columnA %>,<%= columnB %>
