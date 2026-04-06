from scripts.analysis.tabs_v2_analysis import _t_cdf_two_tailed
print("p=0.05, df=10:", _t_cdf_two_tailed(2.228139, 10))
print("p=0.05, df=30:", _t_cdf_two_tailed(2.042272, 30))
print("p=0.99, df=10:", _t_cdf_two_tailed(0.012889, 10))
