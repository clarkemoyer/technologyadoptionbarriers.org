export type GlossaryTermEntry = {
  id: string
  term: string
  category: string
  /** Short definition used in inline tooltips. */
  shortDefinition: string
}

export const glossaryTerms = [
  {
    id: 'cronbach-alpha',
    term: "Cronbach's Alpha (α)",
    category: 'Reliability',
    shortDefinition:
      'Internal consistency reliability - the degree to which all items in a scale measure the same underlying construct. Higher alpha means items are more closely related.',
  },
  {
    id: 'mcdonalds-omega',
    term: "McDonald's Omega (ω)",
    category: 'Reliability',
    shortDefinition:
      'Model-based reliability that accounts for varying item-factor loadings. Unlike alpha, which assumes all items contribute equally (tau-equivalent model), omega uses the actual factor loading weights from a single-factor model.',
  },
  {
    id: 'composite-reliability',
    term: 'Composite Reliability (CR)',
    category: 'Reliability',
    shortDefinition:
      'The proportion of variance in the composite score that is attributable to the true score. CR is computed from factor loadings and is a key component of construct validity assessment alongside AVE.',
  },
  {
    id: 'split-half',
    term: 'Split-Half Reliability',
    category: 'Reliability',
    shortDefinition:
      'An alternative reliability estimate that splits the scale into two halves (odd-numbered vs even-numbered items), computes the correlation between halves, and adjusts for test length.',
  },
  {
    id: 'alpha-if-deleted',
    term: 'Alpha-if-Deleted',
    category: 'Reliability',
    shortDefinition:
      "What Cronbach's alpha would be if a specific item were removed from the scale. Items whose deletion would increase alpha may be weakening internal consistency.",
  },
  {
    id: 'corrected-itc',
    term: 'Corrected Item-Total Correlation (CITC)',
    category: 'Item Analysis',
    shortDefinition:
      "The Pearson correlation between each item and the sum of all other items in the scale (excluding that item). This avoids the part-whole correlation inflation that occurs if the item is included in its own total. It measures how well each item 'tracks' with the rest of the scale.",
  },
  {
    id: 'inter-item-correlation',
    term: 'Inter-Item Correlation Matrix',
    category: 'Item Analysis',
    shortDefinition:
      'The full matrix of pairwise Pearson correlations between all items in a scale. Summary statistics (mean, min, max, SD) describe how tightly items cluster together.',
  },
  {
    id: 'kmo',
    term: 'Kaiser-Meyer-Olkin (KMO) Measure',
    category: 'Factor Analysis',
    shortDefinition:
      'Sampling adequacy for factor analysis. It compares the magnitudes of observed correlations to partial correlations. High KMO means the correlations between variables are largely explained by other variables, making factor analysis appropriate.',
  },
  {
    id: 'bartlett',
    term: "Bartlett's Test of Sphericity",
    category: 'Factor Analysis',
    shortDefinition:
      'Whether the correlation matrix is significantly different from an identity matrix (where all correlations are zero). A significant result means the items share enough variance to support factor analysis.',
  },
  {
    id: 'efa',
    term: 'Exploratory Factor Analysis (EFA)',
    category: 'Factor Analysis',
    shortDefinition:
      'The underlying latent factor structure of a set of items without imposing a pre-specified model. EFA identifies how many factors the data supports and which items load on each factor.',
  },
  {
    id: 'parallel-analysis',
    term: "Horn's Parallel Analysis",
    category: 'Factor Analysis',
    shortDefinition:
      'The number of factors to retain in EFA. It compares actual eigenvalues from the data against eigenvalues generated from random data of the same dimensionality. Factors are retained only when actual eigenvalues exceed the random expectation.',
  },
  {
    id: 'cfa',
    term: 'Confirmatory Factor Analysis (CFA)',
    category: 'Factor Analysis',
    shortDefinition:
      'Tests whether a pre-specified factor structure fits the observed data. Unlike EFA (which discovers structure), CFA confirms whether a hypothesized model adequately reproduces the observed covariance matrix.',
  },
  {
    id: 'ave',
    term: 'Average Variance Extracted (AVE)',
    category: 'Validity',
    shortDefinition:
      'The proportion of variance in the items that is captured by the latent construct (as opposed to measurement error). AVE is the core measure of convergent validity - whether items converge on their intended construct.',
  },
  {
    id: 'htmt',
    term: 'Heterotrait-Monotrait Ratio (HTMT)',
    category: 'Validity',
    shortDefinition:
      'Discriminant validity - whether two constructs are empirically distinct. HTMT estimates the correlation between constructs as if they were measured perfectly (correcting for measurement error). Lower values indicate better discrimination.',
  },
  {
    id: 'fornell-larcker',
    term: 'Fornell-Larcker Criterion',
    category: 'Validity',
    shortDefinition:
      "Discriminant validity by comparing the square root of each construct's AVE against its correlations with other constructs. If a construct shares more variance with its own items than with another construct, they are discriminant.",
  },
  {
    id: 'shapiro-wilk',
    term: 'Shapiro-Wilk Test',
    category: 'Normality',
    shortDefinition:
      'Whether a variable follows a normal distribution. A significant result (p < .05) means the distribution departs significantly from normality.',
  },
  {
    id: 'skewness-kurtosis',
    term: 'Skewness and Kurtosis',
    category: 'Normality',
    shortDefinition:
      'Skewness measures distributional asymmetry (0 = symmetric). Kurtosis measures tail heaviness relative to a normal distribution (0 = normal, positive = heavy tails, negative = light tails).',
  },
  {
    id: 'eigenvalue',
    term: 'Eigenvalue',
    category: 'Factor Analysis',
    shortDefinition:
      "The amount of total variance in the items that a single factor accounts for. Each factor's eigenvalue represents its explanatory power. Eigenvalues sum to the number of variables.",
  },
  {
    id: 'communality',
    term: 'Communality',
    category: 'Factor Analysis',
    shortDefinition:
      "The proportion of an item's variance that is explained by the extracted factors. It is the item-level analogue of R² - how much of this item is captured by the factors.",
  },
  {
    id: 'variance-explained',
    term: 'Cumulative Variance Explained',
    category: 'Factor Analysis',
    shortDefinition:
      'The total percentage of item variance accounted for by all retained factors combined. Higher values mean the factor solution captures more of the systematic variation in the data.',
  },
  {
    id: 'promax',
    term: 'Promax Rotation',
    category: 'Factor Analysis',
    shortDefinition:
      'An oblique rotation method for factor analysis that allows extracted factors to be correlated. This is appropriate when the underlying constructs are theoretically related (as opposed to Varimax, which forces orthogonal/uncorrelated factors).',
  },
  {
    id: 'cfi',
    term: 'Comparative Fit Index (CFI)',
    category: 'CFA Fit Indices',
    shortDefinition:
      'How much better the hypothesized model fits compared to a null (independence) model where all items are uncorrelated. Ranges from 0 to 1.',
  },
  {
    id: 'tli',
    term: 'Tucker-Lewis Index (TLI)',
    category: 'CFA Fit Indices',
    shortDefinition:
      'Similar to CFI but penalizes model complexity. Values can exceed 1.0 or fall below 0. More conservative than CFI for models with many parameters.',
  },
  {
    id: 'rmsea',
    term: 'Root Mean Square Error of Approximation (RMSEA)',
    category: 'CFA Fit Indices',
    shortDefinition:
      'The average amount of misfit per degree of freedom. It estimates how well the model fits the population covariance matrix (not just the sample). Lower is better.',
  },
  {
    id: 'srmr',
    term: 'Standardized Root Mean Square Residual (SRMR)',
    category: 'CFA Fit Indices',
    shortDefinition:
      'The average discrepancy between the observed and model-implied correlation matrices, standardized to a 0-1 scale. Lower values indicate the model reproduces the correlations more faithfully.',
  },
] satisfies readonly GlossaryTermEntry[]
