+++
date = '2025-11-20T21:44:51+01:00'
draft = false
title = 'Modelling Cell-Cell Communication'
tags = ["graph learning", "pytorch", "pytorch-geometric", "python"]
+++

{{< katex >}}

[📚 Read the Thesis](https://drive.google.com/file/d/1zrBcxleUOCsCONvHOM9HgbdlX9DsmGea/view?usp=sharing)

## Introduction

{{< figure src="featured.png" caption="spatial transcriptomics data where each color represents a cell type of mouse's hypothalamus" >}}

I wanted to write a summary on the work I did on my master's thesis. It's been a year-long project exploring statistically learned cell-cell communication. In the end we focused on modeling a network that is biased towards communicating cells [^1].

I won't go into the many different branches explored in the thesis [^2], which include bilevel optimization and graph structure learning, so I'll give a quick background on the topic then explore some interesting results on how regularization affects internal model logic, and how we can prove that there's meaningful information to be gained from a cell's microenvironment.

## Background

### Biology

The question that we want to answer is understanding _how_ cells communicate. Obviously there are many different cellular modes of communication:

{{< figure src="cell-communication.png" caption="(a) paracrine signaling (b) contact signaling (c) endocrine signaling (d) synaptic signaling" >}}

Here we're interested in local (paracrine) signaling, using what's known as a ligand receptor pair. We can think of ligand receptor pairs as a lock and key pair that cause a change of state in the downstream receiving cell. Ligand/receptor are so important that they comprise of nearly ~30% of all the proteins of the body [^3].

### Data

So how do we even capture this data? [Spatial transcriptomics](https://en.wikipedia.org/wiki/Spatial_transcriptomics) basically focuses on measuring spatially-resolved gene counts. This is a fancy way of saying that we can measure gene counts spatially at discrete locations called “spots” on the tissue.

When "spot" resolution becomes sub-cellular, we can actually measure discrete cells and their gene counts, instead of an average of a cell's microenvironment.

So what does the gene have to do with ligand receptor pairs? Well if we remind ourselves of some highschool physics, genes are basically snippets of mRNA (messenger RNA) that get translated into actual proteins. And since ligand receptor pairs can be proteins, we can use these gene counts as proxies to the proteins in the cell!

## Pipeline

So what are we trying to do again? We're trying to statistically model _how_ cells communicate. This means that we need to train a model (neural network or other) to predict cells communicate with each other. We do this by creating a model that learns how a gene's transcriptome looks like from its communicating neighbours.

The pipeline is divided into four parts:

1. Preprocessing
2. Graph Construction
3. Graph Sampling
4. Model Training

### Preprocessing

Since genes are generally highly correlated to each other, it makes sense to do some dimensionality reduction. PCA here should do the job.

Next we need to isolate genes that show signs of signaling. Classically this is done with quantifying some spatial patterns between ligand-receptor pair candidates. Intuitively, cells sending ligands should have receiving cells in the vicinity.

More formally though, we define this spatial correlation using the Moran's I bivariate correlation:

$$
I=\frac{n}{S*0}\frac{z_x^TWz_Y}{z_x^Tz_x}
$$

$$
\text{where:} \quad z_x = \frac{x-\mu_x}{\sigma_x}, \quad z_Y = \frac{Y-\mu_Y}{\sigma_Y} \\
n = |x|, \quad S_0 = \sum_i \sum_j W*{i,j}
$$

We can then pick the ligand receptor pairs that show the highest spatial correlation for further analysis.

{{< figure src="morans_I_visualization.png" caption="penk-oprk1 showed high spatial correlation as can be shown here" >}}

### Graph Construction

Now that we have our ligand-receptor pair of interest, we want to construct a graph representing how cells communicate.

We do this by assuming that the transportation of ligands to receiver cell's receptors follows some form of optimal transport.

[Optimal transport](<https://en.wikipedia.org/wiki/Transportation_theory_(mathematics)>) is a mathematical theorem that deals with finding the lowest cost transport plan between two sets, usually a resource producer set and a resource consumer set.

Classical optimal transport assumes the sets are bijective, meaning that each producer can satisfy each consumer. In the real world though, this can't be the case and that's where unbalanced optimal transport comes into play. Here the optimal transport plan can be found while allowing some mass losses, or creations.

I won't go into the mathematical formalization in this blog post to keep this short, but it's a very interesting topic and I recommend the very well explained script by [Peyré](https://arxiv.org/pdf/2505.06589) [^4]. For unbalanced optimal transport I recommend [Sejourne's](https://arxiv.org/abs/2211.08775) script on it [^5].

Suffice it to say, through some numeric unbalanced optimal transport libraries, we can find the transport plan that minimizes some distance based cost function. Additionally, ligand-receptor pairs beyond a hard programmed threshold are considered to have an infinite cost.

What we get in the end is an nxn adjacency matrix that denotes the number of ligands that go from a the sender cells to the receiver cells.

Plotting this unbalanced adjacency matrix on our spatial transcriptomics data of a mouse's hypothalamus we get:

{{< figure src="hypothalamus_transport_graph.png" caption="undirected graph constructed by optimizing the unbalanced optimal transport problem" >}}

### Graph Sampling

The model that we're trying to create is supposed to model communicating cells. This motivates a form of "communication graph" bias.

This means that from the full transport adjacency matrix T, we subsample graphs that are more likely communicating from graphs that are less likely to communicate.

Formally:

$$
p_{\text{comm}}(v_j) = \frac{\sum_i^n \mathcal{T}_{i,j}}{{\sum_i^n\sum_j^n \mathcal{T}_{i,j}}} \\ \text{where}: v_{\text{comm}} \sim p_{\text{comm}}
$$

Here, we sample a cell v from p, and build a graph from all the 1-hop neighbours of v that correspond to its sender cells from the transport adjacency T.

### Model Training

{{< figure src="model_architecture.jpeg" caption="Overview of the neural network we use to train our communication model" >}}

Now that we collected all our building blocks to generate communiation graphs, we can start training our model.

As shown in the previous figure, we mask the receiver cell's transcriptome. Here our goal is to predict the cell's transcriptome from its communicating sender cells and the cell's type.

This is justified by the fact that a cell's transcriptome depends on its type AND the signal transduction caused by its microenvironment.

In our architecture, we use GATv2 message passing, and allow our sender cells' transcriptome to be used in the prediction. Additionally, we use a learnable lookup table to create an embedding of the cell type.

The cell-type embedding and the graph encoded neighborhood information are concatinated. Next, we use a simple variational encoder to regress to the real transcriptome.

And that's basically the full pipeline. Let's look at some interesting insights from the model.

## Results

Let's start by analyzing the difference in the receiver transcriptome's reconstruction scores. These scores are with a completely unseen test dataset.

Here we compare the difference between variational encoders (which were regularized with kulback leibler divergence and used the reparameterization trick) and deterministic encoders using:

- The MSE of the full transcriptome
- The MAE specifically of the receptor within the full transcriptome

|                 | Encoder       | MSE      | MAE      |
| --------------- | ------------- | -------- | -------- |
| penk - oprk1    | variational   | 3.42     | 0.07     |
|                 | deterministic | **1.38** | **0.05** |
| penk - oprd1    | variational   | 4.49     | 0.10     |
|                 | deterministic | **1.02** | **0.05** |
| gal - galr1     | variational   | 2.90     | 0.06     |
|                 | deterministic | **1.29** | **0.04** |
| gal - galr2     | variational   | 4.02     | 0.05     |
|                 | deterministic | **1.91** | **0.05** |
| galanin pathway | variational   | 3.49     | -        |
|                 | deterministic | **1.46** | -        |
| opioid pathway  | variational   | 3.72     | -        |
|                 | deterministic | **1.58** | -        |

What's interesting to see is that deterministic encoders almost always outperformed variational encoders. This we will show later does not mean a better generalization!

### Model Ablation

Next let's prove that both neighborhood information AND cell type are important in predicting the cell's transcriptome.

To evaluate their individual contributions, we test two different models with deterministic encoders: one that exclusively uses the neighborhood information, and another that exclusively uses receiver cell type information.

For the **neighborhood-only model**, we remove the concatenation of the embedded receiver type as shown in the architecture figure (III) and we adjust the layer dimensions to match the reduction in dimensions.

For the **receiver-only model**, we completely abandon the message passing step in the architecture figure (II) and instead directly use the y_embed to encode the hidden representation as shown in the architecture figure (III), basically reducing the model to an MLP.

As shown in Table \ref{tab:ablation}, combining both the receiver cell type and neighborhood information achieved the best performance in our summed regression and the receptor regression.

|                                                               | MSE  | MAE  |
| ------------------------------------------------------------- | ---- | ---- |
| $$f_{\theta}(y_{\text{receiver}},\mathcal{N_{\mathcal{G}}})$$ | 1.43 | 0.06 |
| $$f_{\theta}(\mathcal{N_{\mathcal{G}}})$$                     | 2.22 | 0.08 |
| $$f_{\theta}(y_{\text{receiver}})$$                           | 4.41 | 0.09 |

This is some pretty cool proof that our model is already doing something meaningful!

### Perturbation Experiments

Finally, we analyze the generalizability of the model. This is a daunting task, so we devise a set of experiments to evaluate generalization.

Given two sampled graphs

$$
\mathcal{G}_1 = (V_1, E_1, A_1, Y_1, X_1)
\quad \text{and} \quad
\mathcal{G}_2 = (V_2, E_2, A_2, Y_2, X_2),
$$

with

$$
Y = Y^{\text{sender}} \cup Y^{\text{receiver}}, \qquad
Y^{\text{sender}} \cap Y^{\text{receiver}} = \emptyset.
$$

Here, \( V \), \( E \), \( A \), \( Y \), and \( X \) denote the nodes, edges, edge attributes, cell types, and normalized log-transformed gene counts, respectively.

We say that the graphs \( \mathcal{G}\_1 \) and \( \mathcal{G}\_2 \) are _topologically equivalent_, denoted

$$
\mathcal{G}_1 \cong \mathcal{G}_2,
$$

if the following conditions hold:

- \( |E_1| = |E_2| \)
- \( Y_1^{\text{sender}} = Y_2^{\text{sender}} \)

This definition implies that two graphs are considered topologically equivalent if they have the same number of edges and the same distribution of sender cell types. Notably, this definition does **not** require the receiver cell types to be the same.

The perturbation experiments begin by first identifying topologically equivalent graphs \( \mathcal{G}\_1 \) and \( \mathcal{G}\_2 \). We then design two types of perturbation experiments.

---

### Experiment 1: Full Graph Perturbation

In the first experiment, for a ligand \( L \), we create a perturbed graph \( \mathcal{G}\_{1\text{p}} \) defined as:

- \( X^{\text{sender}}_{\mathcal{G}_{1\text{p}}}[:, i] = X^{\text{sender}}\_{\mathcal{G}\_1}[:, i] \quad \forall i \neq L \)
- \( X^{\text{sender}}_{\mathcal{G}_{1\text{p}}}[:, L] = X^{\text{sender}}\_{\mathcal{G}\_2}[:, L] \)
- \( A\_{1\text{p}} = A_2 \)
- \( Y^{\text{receiver}}\_{1\text{p}} = Y^{\text{receiver}}\_2 \)

Visually:

{{< figure src="experiment1.png" caption="" >}}

### Experiment 2: Ligand-Only Perturbation

In the second experiment, we perturb only the ligand features while keeping the graph structure and receiver information unchanged. For a ligand \( L \), the perturbed graph \( \mathcal{G}\_{1\text{p}} \) is defined as:

- \( X^{\text{sender}}_{\mathcal{G}_{1\text{p}}}[:, i] = X^{\text{sender}}\_{\mathcal{G}\_1}[:, i] \quad \forall i \neq L \)
- \( X^{\text{sender}}_{\mathcal{G}_{1\text{p}}}[:, L] = X^{\text{sender}}\_{\mathcal{G}\_2}[:, L] \)

Visually:
{{< figure src="experiment2.png" caption="" >}}

### Metrics

We define the relative similarity between two values \( x_1 \) and \( x_2 \) as

$$
\text{sim}(x_1, x_2)
= 1 - \frac{|x_2 - x_1|}{x_2 + \epsilon},
\tag{1}
$$

and the mean relative change as

$$
\Delta(x_1, x_2)
= \frac{|x_2 - x_1|}{x_2 + \epsilon}.
\tag{2}
$$

In our interpolation experiments, we measure three primary metrics:

- A quantification of the similarity between the perturbed graph \( \mathcal{G}\_{1\text{p}} \)’s receptor regression and \( \mathcal{G}\_2 \)’s receptor **regression**, using the relative similarity definition (1).

- A quantification of the similarity between the perturbed graph \( \mathcal{G}\_{1\text{p}} \)’s receptor regression and \( \mathcal{G}\_2 \)’s **target** receptor, using the same relative similarity
  definition (1).

- The mean relative change between the receptor regressions of \( \mathcal{G}_1 \) and the perturbed graph \( \mathcal{G}_{1\text{p}} \), computed using the perturbation definition (2).

### Results of Perturbation Experiments

We first analyze the tables from experiment 1:

|              | $$\text{Encoder}$$ | $$\text{sim}(\hat{x}^{\text{rec}}_{\mathcal{G}\_1\text{p}},\hat{x}^{\text{rec}}_{\mathcal{G}\_2})$$ | $$\text{sim}(\hat{x}^{\text{rec}}_{\mathcal{G}_1\text{p}},x^{\text{rec}}_{\mathcal{G}_2})$$ | $$\Delta(\hat{x}^{\text{rec}}_{\mathcal{G}_1},\hat{x}^{\text{rec}}_{\mathcal{G}\_1\text{p}})$$ |
| ------------ | ------------------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| penk - oprk1 | variational        | **0.71**                                                                                            | **0.62**                                                                                    | 0.15                                                                                           |
|              | deterministic      | 0.66                                                                                                | 0.58                                                                                        | 0.04                                                                                           |
| penk - oprd1 | variational        | **0.89**                                                                                            | **0.65**                                                                                    | 0.10                                                                                           |
|              | deterministic      | 0.75                                                                                                | 0.61                                                                                        | 0.04                                                                                           |
| gal - galr1  | variational        | **0.92**                                                                                            | 0.57                                                                                        | 0.08                                                                                           |
|              | deterministic      | 0.84                                                                                                | **0.58**                                                                                    | 0.04                                                                                           |
| gal - galr2  | variational        | **0.94**                                                                                            | **0.79**                                                                                    | 0.08                                                                                           |
|              | deterministic      | 0.89                                                                                                | 0.78                                                                                        | 0.05                                                                                           |

Here, \( \hat{x}^{\text{rec}} \) denotes the model regression on the receptor feature, and \( x^{\text{rec}} \) denotes the ground-truth target for the receptor feature.

These experiments were conducted by identifying 250 topologically equivalent graph pairs from the test dataset and averaging the reported metrics across these pairs.

Several important observations emerge:

1. **Consistency and smooth interpolation**  
   Across all datasets, variational encoders exhibit better consistency and smoother interpolation behavior between similar graphs \( \mathcal{G}\_{1\text{p}} \) and \( \mathcal{G}\_2 \).

2. **Sensitivity to perturbations**  
   Variational encoders show larger perturbation-induced changes, indicating that the model does not simply regress toward a global mean, but instead meaningfully depends on the neighborhood structure and receiver cell types.

3. **Closeness to ground truth**  
   In most cases, the perturbation responses of variational encoders are closer to the ground-truth receptor targets of \( \mathcal{G}\_2 \).

Next we look at experiment 2:

|              | $$\text{Encoder}$$ | $$ \text{sim}(\hat{x}^{\text{rec}}_{\mathcal{G}\_1\text{p}},\hat{x}^{\text{rec}}_{\mathcal{G}\_2})$$ | $$\text{sim}(\hat{x}^{\text{rec}}_{\mathcal{G}_1\text{p}},x^{\text{rec}}_{\mathcal{G}_2})$$ | $$\Delta(\hat{x}^{\text{rec}}_{\mathcal{G}_1},\hat{x}^{\text{rec}}_{\mathcal{G}_1\text{p}})$$ |
| ------------ | ------------------ | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| penk - oprk1 | variational        | **0.70**                                                                                             | **0.61**                                                                                    | 0.11                                                                                          |
|              | deterministic      | 0.65                                                                                                 | 0.57                                                                                        | 0.00                                                                                          |
| penk - oprd1 | variational        | **0.85**                                                                                             | **0.64**                                                                                    | 0.05                                                                                          |
|              | deterministic      | 0.76                                                                                                 | 0.63                                                                                        | 0.00                                                                                          |
| gal - galr1  | variational        | **0.90**                                                                                             | 0.57                                                                                        | 0.06                                                                                          |
|              | deterministic      | 0.83                                                                                                 | **0.58**                                                                                    | 0.00                                                                                          |
| gal - galr2  | variational        | **0.90**                                                                                             | **0.79**                                                                                    | 0.03                                                                                          |
|              | deterministic      | 0.88                                                                                                 | 0.78                                                                                        | 0.00                                                                                          |

Interestingly, the deterministic encoder’s regression outputs remain unchanged after perturbing the ligands across all ligand–receptor pairs. This suggests that the model’s predictions depend primarily on the receiving cell types and edge attributes.

In contrast, variational encoders exhibit a clear relationship between ligand and receptor regressions, even in the absence of edge attributes and receiving cell type information. This indicates an absolute improvement in regression similarities, along with some improvement in target similarities.

---

These perturbation experiments prove something very insightful when evaluting models; test scores don't prove generalizeability! As we just saw even with significantly worse MSE scores on the cell's transcriptome, variational encoders still proved to be better at interpolating and generalizing the effects of ligand-receptor pairs on the modeling when compared to deterministic encoders.

So if there's one thing to take home in a very short and concise sentance: don't be fooled by test scores, they don't describe the full picture.

[^1]: If a research topic can be represented as a fractal, is there a [fractal dimension](https://en.wikipedia.org/wiki/Fractal_dimension) for different research topics?

[^2]: I should write a blog post on graph structure learning

[^3]:
    Urry, L., M. Cain, S. Wasserman, P. Minorsky, and R. Orr (2020). Campbell biology. Pearson
    Boston.

[^4]: Peyré, G. (2025). “Optimal Transport for Machine Learners”. In: arXiv preprint arXiv:2505.06589.

[^5]:
    Séjourné, T., G. Peyré, and F.- X. Vialard (2023). “Unbalanced optimal transport, from
    theory to numerics”. In: Handbook of Numerical Analysis 24, pp. 407–471
