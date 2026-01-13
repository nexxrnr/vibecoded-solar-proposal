import pygal
# needs cairosvg
from pygal.style import Style


custom_style = Style(font_family='googlefont:Rubik', value_colors=['#ffffff', "#ffffff"], legend_font_size = 24, opacity='1', background='transparent',
  plot_background='transparent', colors=('#f8d26a', '#102e5d', '#102eee')) # yelow from proposal design, blue from proposal design
pie_chart = pygal.Pie(print_values = True, legend_box_size = 10, width=600, height=500, style=custom_style)
pie_chart.add('EPS', 30)
pie_chart.add('Solar', 1000)
pie_chart.render_to_file('pie_chart_test.svg')
