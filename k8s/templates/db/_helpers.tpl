{{/*
Database name
*/}}
{{- define "balancer.db.name" -}}
{{- .Values.database.name | default "balancer_dev" }}
{{- end }}

{{/*
Database user
*/}}
{{- define "balancer.db.user" -}}
{{- .Values.database.user | default "balancer" }}
{{- end }}

{{/*
Database labels
*/}}
{{- define "balancer.db.labels" -}}
{{- include "balancer.labels" . | nindent 0 }}
app.kubernetes.io/component: database
{{- end }}

{{/*
Database selector labels
*/}}
{{- define "balancer.db.selectorLabels" -}}
{{- include "balancer.selectorLabels" . | nindent 0 }}
app.kubernetes.io/component: database
{{- end }} 