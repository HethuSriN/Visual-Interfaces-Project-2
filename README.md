# Visual-Interfaces-Project-2
Visual Interfaces Group Project(2)

Earthquake Data Visualization Dashboard
🌍 Project Title: Interactive Earthquake Exploration Dashboard
Team Members: Hethu Sri Nadipudi.
 Mosaad Ahmed Mohammed.
 Shreya Barki.
 Viraj Kishore Charakanam.
 Saad Ahmed Mohammed.
________________________________________
🧠 Motivation
This interactive visualization platform is designed to help users explore, understand, and analyze earthquake patterns around the world. From seismologists and geoscientists to general enthusiasts, users can:
•	Observe global seismic activity over time.
•	Analyze earthquake distribution by magnitude, depth, and duration.
•	Explore high-risk zones with predictive modeling.
•	Hear audio cues for earthquake severity.
The dashboard is intended to make complex seismic data engaging, intuitive, and informative through visual and interactive storytelling.
________________________________________
📊 Data
Source: The datasets have been downloaded from the below provided link. Here the dataset has been downloaded for 20 years but the real challenge was the website only allowed to download only 20000 records at a time.
Dataset Link: https://earthquake.usgs.gov/earthquakes/search/
Data Attributes:
•	time: Date and time of the earthquake.
•	latitude & longitude: Location coordinates.
•	depth: Earthquake depth in km.
•	mag: Magnitude.
•	place: Descriptive location.
•	type: Type of seismic event (usually earthquake).
•	net, id, updated, etc. for metadata.
The data is aggregated from various years to provide comprehensive global coverage.
________________________________________
💡 Visualization Components
🔎 1. Interactive Map
•	Built with Leaflet.js.
•	Displays earthquake epicenters as circles.
•	Color and radius indicate magnitude.
•	Zoom/pan and rectangle-drawing enable geographical filtering.
•	Tooltip shows magnitude, location, depth, and time.
🔥 2. Heatmap Timeline
•	Built with D3.js.
•	Encodes frequency of earthquakes over time (day, week, month, year).
•	Brushing on this heatmap filters all views.
📊 3. Bar Chart (Magnitude/Depth/Duration)
•	Selectable chart view.
•	Bins earthquakes and allows users to click bars to filter other views.
🌐 4. Mini Globe
•	Orthographic projection with rotating animation.
•	Visualizes predicted high-risk zones using recent data trends.
•	Tooltip on hover shows latitude, longitude, and risk score.
📋 5. Dashboard Stats Panel
•	Shows:
o	Total Earthquake Count
o	Average Magnitude
o	Most Affected Location (by count, magnitude, or energy)
o	Predicted Risk Areas on Mini Globe
🎛️ 6. Controls
•	Background Selector: Switch between terrain, satellite, topo maps.
•	Sound Toggle: Turn on/off quake sound effects.
•	Animation Controls: Play/stop timeline animation.
•	Speed Slider: Adjust frame rate.
•	Timeline Slider: Navigate chronologically.
•	Reset Button: Clear all filters.
•	Help Button: UI guidance and feature list.
All views are tightly coupled. Any interaction (e.g. brushing, selecting, filtering) updates all components live.
________________________________________
✍️ Design Sketches & Justification
•	Card-Based Layout: Keeps visual balance between map, charts, and statistics.
•	Mini Globe on Side: A small but engaging touch, always rotating.
•	Bright Tooltip Color Scheme: Ensures visibility on all map backgrounds.
•	Responsive Flex Layout: Ensures readability across desktop and tablet screens.
•	Earth Tone Color Palette: Keeps the focus on the data.
________________________________________
🔍 Discoveries & Insights
Using the dashboard, we were able to:
•	Observe that earthquake frequency is seasonal in some regions.
•	Identify Pacific Ring of Fire as the most active seismic belt.
•	Find high-magnitude clustering in regions like Indonesia and Alaska.
•	Use the predictive model to highlight emerging risk zones in South Pacific and Central Asia.
•	Hear high-magnitude quakes through distinct sound cues.
________________________________________
🛠️ Technical Process
📚 Libraries Used:
•	D3.js (v6)
•	Leaflet.js
•	Leaflet.draw
•	TopoJSON
•	Howler.js (for sound effects)
🧱 Code Structure:
•	main.js: Orchestrates all data loading and initial renderings.
•	leafletMap.js: Handles interactive map rendering.
•	quakeChart.js: Handles bar charts.
•	quakeHeatmap.js: Timeline-based heatmap.
•	miniGlobe.js: Predictive globe visualization.
•	style.css: Styling and layout.
🚀 Run & Access:
•	Code Repository: https://github.com/HethuSriN/Visual-Interfaces-Project-2
•	Live Link: https://visual-interfaces-project-2.vercel.app/
________________________________________
🎥 Demo Video
Link provided
•	Explains each feature with captions and voiceover.
•	Shows real-time brushing, map filtering, and globe spinning.
•	Walkthrough of dashboard components.
________________________________________
👥 Team Contributions
•	Hethu Sri Nadipudi
o	Data cleaning & preprocessing.
o	Chart rendering (bar chart & heatmap).

•	Mosaad Ahmed Mohammed
o	Predictive model for mini globe.
o	Globe rotation & tooltip logic.
![image](https://github.com/user-attachments/assets/e289de31-4372-421b-a03b-18b75922224e)

•	Shreya Barki
o	Sound integration (Howler.js).
o	UI controls & timeline animation.

•	Viraj Kishore Charakanam
o	Dashboard layout & styling.
o	Leaflet Map & interactions.

•	Saad Ahmed Mohammed
o	Brushing Technique for all the Visualizations.
o	Stats panel logic (average, most affected).
________________________________________

Snapshots:
