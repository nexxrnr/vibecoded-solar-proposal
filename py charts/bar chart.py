import pygal
from pygal.style import Style
import random


monthly_costs_pre_solar = {}
monthly_costs_post_solar = {}
x_labels = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Avg', 'Sep', 'Okt', 'Nov', 'Dec']

for i in range(1,13):
    monthly_costs_pre_solar[str(i)] = random.randint(2500, 4500)
    monthly_costs_post_solar[str(i)] = random.randint(1500, 2500)

custom_style = Style(font_family='googlefont:Raleway', label_font_size = 16, legend_font_size = 24, opacity='1', background='transparent',
  plot_background='transparent', colors=('#f8d26a', '#102e5d')) # yelow from proposal design, blue from pro

bar_chart = pygal.Bar(style = custom_style, width = 600, height = 400, legend_at_bottom = True)
bar_chart.x_labels = x_labels
bar_chart.add(values = monthly_costs_pre_solar.values(), title = 'Bez solara')
bar_chart.add(values = monthly_costs_post_solar.values(), title = 'Sa solarom')
bar_chart.render()
bar_chart.render_to_file('/tmp/bar_chart.svg')
