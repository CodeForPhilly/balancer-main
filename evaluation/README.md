# Evaluations

## `evals`: LLM evaluations to test and improve model outputs

### Evaluation Metrics

Natural Language Generation Performance:

[Extractiveness](https://huggingface.co/docs/lighteval/en/metric-list#automatic-metrics-for-generative-tasks):

* Extractiveness Coverage: Extent to which a summary is derivative of a text
* Extractiveness Density: How well the word sequence can be described as series of extractions
* Extractiveness Compression: Word ratio between the article and the summary

API Performance:

* Token Usage (input/output)
* Estimated Cost in USD
* Duration (in seconds)

### Test Data

Generate the dataset file by connecting to a database of research papers:

Connect to the Postgres database of your local Balancer instance:

```
from sqlalchemy import create_engine

engine = create_engine("postgresql+psycopg2://balancer:balancer@localhost:5433/balancer_dev")
```

Connect to the Postgres database of the production Balancer instance using a SQL file:

```
# Add Postgres.app binaries to the PATH 
echo 'export PATH="/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"' >> ~/.zshrc

createdb <DB_NAME>
pg_restore -v -d <DB_NAME> <PATH_TO_BACKUP>.sql
```

Generate the dataset CSV file:

```
from sqlalchemy import create_engine
import pandas as pd

engine = create_engine("postgresql://<USER>@localhost:5432/<DB_NAME>")

query = "SELECT * FROM api_embeddings;"
df = pd.read_sql(query, engine)

df['INPUT'] = df.apply(lambda row: f"ID: {row['chunk_number']} | CONTENT: {row['text']}", axis=1)

# Ensure the chunks are joined in order of chunk_number by sorting the DataFrame before grouping and joining
df = df.sort_values(by=['name', 'upload_file_id', 'chunk_number'])
df_grouped = df.groupby(['name', 'upload_file_id'])['INPUT'].apply(lambda chunks: "\n".join(chunks)).reset_index()

df_grouped.to_csv('<DATASET_CSV_PATH>', index=False)
```

### Running an Evaluation

#### Bulk Model and Prompt Experimentation

Compare the results of many different prompts and models at once

```
import pandas as pd

data = [
    {
    "MODEL": "<MODEL_NAME_1>",
    "INSTRUCTIONS": """<YOUR_QUERY_1>"""
    },
    {
    "MODEL": "<MODEL_NAME_2>",
    "INSTRUCTIONS": """<YOUR_QUERY_2>"""
    },
]

df = pd.DataFrame.from_records(data)

df.to_csv("<EXPERIMENTS_CSV_PATH>", index=False)
```


#### Execute on the Command Line


Execute [using `uv` to manage dependencies](https://docs.astral.sh/uv/guides/scripts/) without manually managing enviornments:

```sh
uv run evals.py --experiments path/to/<EXPERIMENTS_CSV> --dataset path/to/<DATASET_CSV> --results path/to/<RESULTS_CSV>
```

Execute without using uv run by ensuring it is executable:

```sh
./evals.py --experiments path/to/<EXPERIMENTS_CSV> --dataset path/to/<DATASET_CSV> --results path/to/<RESULTS_CSV>
```

### Analyzing Test Results

```
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

df = pd.read_csv("<RESULTS_CSV_PATH>")

# Define the metrics of interest
extractiveness_cols = ['Extractiveness Coverage', 'Extractiveness Density', 'Extractiveness Compression']
token_cols = ['Input Token Usage', 'Output Token Usage']
other_metrics = ['Cost (USD)', 'Duration (s)']
all_metrics = extractiveness_cols + token_cols + other_metrics

# Metric Histograms by Model
plt.style.use('default')
fig, axes = plt.subplots(len(all_metrics), 1, figsize=(12, 4 * len(all_metrics)))

models = df['MODEL'].unique()
colors = plt.cm.Set3(np.linspace(0, 1, len(models)))

for i, metric in enumerate(all_metrics):
    ax = axes[i] if len(all_metrics) > 1 else axes
    
    # Create histogram for each model
    for j, model in enumerate(models):
        model_data = df[df['MODEL'] == model][metric]
        ax.hist(model_data, alpha=0.7, label=model, bins=min(8, len(model_data)), 
                color=colors[j], edgecolor='black', linewidth=0.5)
    
    ax.set_title(f'{metric} Distribution by Model', fontsize=14, fontweight='bold')
    ax.set_xlabel(metric, fontsize=12)
    ax.set_ylabel('Frequency', fontsize=12)
    ax.legend(title='Model', bbox_to_anchor=(1.05, 1), loc='upper left')
    ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()

# Metric Statistics by Model
for metric in all_metrics:
    print(f"\n{metric.upper()}:")
    desc_stats = df.groupby('MODEL')[metric].agg([
        'count', 'mean', 'std', 'min', 'median','max'
    ])

    print(desc_stats)


# Calculate Efficiency Metrics By model
df_analysis = df.copy()
df_analysis['Total Token Usage'] = df_analysis['Input Token Usage'] + df_analysis['Output Token Usage']
df_analysis['Cost per Token'] = df_analysis['Cost (USD)'] / df_analysis['Total Token Usage']
df_analysis['Tokens per Second'] = df_analysis['Total Token Usage'] / df_analysis['Duration (s)']
df_analysis['Cost per Second'] = df_analysis['Cost (USD)'] / df_analysis['Duration (s)']

efficiency_metrics = ['Cost per Token', 'Tokens per Second', 'Cost per Second']

for metric in efficiency_metrics:
    print(f"\n{metric.upper()}:")
    eff_stats = df_analysis.groupby('MODEL')[metric].agg([
        'count', 'mean', 'std', 'min', 'median', 'max'
    ])

    for col in ['mean', 'std', 'min', 'median', 'max']:
        eff_stats[col] = eff_stats[col].apply(lambda x: f"{x:.3g}")
    print(eff_stats)


```

### Contributing

You're welcome to add LLM models to test in `server/api/services/llm_services`