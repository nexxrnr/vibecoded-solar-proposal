import pygal
from pygal.style import Style
from PIL import Image
from io import BytesIO

# Create a Pygal chart
bar_chart = pygal.Bar(style=Style(legend_font_size=10))
bar_chart.title = 'Sample Bar Chart'
bar_chart.x_labels = ['A', 'B', 'C', 'D']
bar_chart.add('Series 1', [3, 5, 1, 7])
bar_chart.add('Series 2', [4, 2, 6, 8])

# Save the chart as an SVG to an in-memory BytesIO stream
svg_stream = BytesIO()
bar_chart.render_to_file(svg_stream)

# Reset the stream's position to the beginning
svg_stream.seek(0)

# You can now use svg_stream for further processing or save it to a file if needed
# For example, you can convert it to a PNG using Pillow
image = Image.open(svg_stream)
image.save('chart.png', 'PNG')

print("Chart saved as chart.png")
