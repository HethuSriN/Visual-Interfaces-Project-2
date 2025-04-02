# Earthquake Data Visualization Dashboard

## 🌍 Project Title: Interactive Earthquake Exploration Dashboard

**Team Members:**  
Hethu Sri Nadipudi  
Mosaad Ahmed Mohammed  
Shreya Barki  
Viraj Kishore Charakanam  
Saad Ahmed Mohammed  

---

## 📑 Table of Contents

1. [Project Title](#project-title-interactive-earthquake-exploration-dashboard)
2. [Motivation](#-motivation)
3. [Data](#-data)
4. [Visualization Components](#-visualization-components)
   - [Interactive Map](#1-interactive-map)
   - [Heatmap Timeline](#2-heatmap-timeline)
   - [Bar Chart (Magnitude/Depth/Duration)](#3-bar-chart-magnitudedepthduration)
   - [Mini Globe](#4-mini-globe)
   - [Dashboard Stats Panel](#5-dashboard-stats-panel)
   - [Controls](#6-controls)
5. [Design Sketches & Justification](#-design-sketches--justification)
6. [Discoveries & Insights](#-discoveries--insights)
7. [Technical Process](#-technical-process)
8. [Demo Video](#-demo-video)
9. [Team Contributions](#-team-contributions)

---

## 🧠 Motivation

This interactive visualization platform is designed to help users explore, understand, and analyze earthquake patterns around the world. From seismologists and geoscientists to general enthusiasts, users can:

- Observe global seismic activity over time.
- Analyze earthquake distribution by magnitude, depth, and duration.
- Explore high-risk zones with predictive modeling.
- Hear audio cues for earthquake severity.

The dashboard is intended to make complex seismic data engaging, intuitive, and informative through visual and interactive storytelling.

---

## 📊 Data

**Source:**  
The datasets have been downloaded from the below provided link. Here the dataset has been downloaded for 20 years but the real challenge was the website only allowed to download only 20000 records at a time.

**Dataset Link:**  
https://earthquake.usgs.gov/earthquakes/search/

**Data Attributes:**

- `time`: Date and time of the earthquake.
- `latitude` & `longitude`: Location coordinates.
- `depth`: Earthquake depth in km.
- `mag`: Magnitude.
- `place`: Descriptive location.
- `type`: Type of seismic event (usually earthquake).
- `net`, `id`, `updated`, etc.: Metadata.

The data is aggregated from various years to provide comprehensive global coverage.

---

## 💡 Visualization Components

### 🔎 1. Interactive Map

- Built with Leaflet.js.
- Displays earthquake epicenters as circles.
- Color and radius indicate magnitude.
- Zoom/pan and rectangle-drawing enable geographical filtering.
- Tooltip shows magnitude, location, depth, and time.

### 🔥 2. Heatmap Timeline

- Built with D3.js.
- Encodes frequency of earthquakes over time (day, week, month, year).
- Brushing on this heatmap filters all views.

### 📊 3. Bar Chart (Magnitude/Depth/Duration)

- Selectable chart view.
- Bins earthquakes and allows users to click bars to filter other views.

### 🌐 4. Mini Globe

- Orthographic projection with rotating animation.
- Visualizes predicted high-risk zones using recent data trends.
- Tooltip on hover shows latitude, longitude, and risk score.

### 📋 5. Dashboard Stats Panel

- Shows:
  - Total Earthquake Count
  - Average Magnitude
  - Most Affected Location (by count, magnitude, or energy)
  - Predicted Risk Areas on Mini Globe

### 🎛️ 6. Controls

- Background Selector: Switch between terrain, satellite, topo maps.
- Sound Toggle: Turn on/off quake sound effects.
- Animation Controls: Play/stop timeline animation.
- Speed Slider: Adjust frame rate.
- Timeline Slider: Navigate chronologically.
- Reset Button: Clear all filters.
- Help Button: UI guidance and feature list.

> All views are tightly coupled. Any interaction (e.g. brushing, selecting, filtering) updates all components live.

---

## ✍️ Design Sketches & Justification

- Card-Based Layout: Keeps visual balance between map, charts, and statistics.
- Mini Globe on Side: A small but engaging touch, always rotating.
- Bright Tooltip Color Scheme: Ensures visibility on all map backgrounds.
- Responsive Flex Layout: Ensures readability across desktop and tablet screens.
- Earth Tone Color Palette: Keeps the focus on the data.

---

## 🔍 Discoveries & Insights

Using the dashboard, we were able to:

- Observe that earthquake frequency is seasonal in some regions.
- Identify Pacific Ring of Fire as the most active seismic belt.
- Find high-magnitude clustering in regions like Indonesia and Alaska.
- Use the predictive model to highlight emerging risk zones in South Pacific and Central Asia.
- Hear high-magnitude quakes through distinct sound cues.

---

## 🛠️ Technical Process

**📚 Libraries Used:**

- D3.js (v6)
- Leaflet.js
- Leaflet.draw
- TopoJSON
- Howler.js (for sound effects)

**🧱 Code Structure:**

- `main.js`: Orchestrates all data loading and initial renderings.
- `leafletMap.js`: Handles interactive map rendering.
- `quakeChart.js`: Handles bar charts.
- `quakeHeatmap.js`: Timeline-based heatmap.
- `miniGlobe.js`: Predictive globe visualization.
- `style.css`: Styling and layout.

**🚀 Run & Access:**

- Live Link: https://visual-interfaces-project-2.vercel.app/
- Code Repository: https://github.com/HethuSriN/Visual-Interfaces-Project-2

---

## 🎥 Demo Video

**Link provided:https://drive.google.com/file/d/1Eza_gtov8YmFT35_lD3_rETAmdBiUW3Y/view**

- Explains each feature with captions and voiceover.
- Shows real-time brushing, map filtering, and globe spinning.
- Walkthrough of dashboard components.

---

## 👥 Team Contributions

- **Hethu Sri Nadipudi**
  - Data cleaning & preprocessing.
  - Chart rendering (bar chart & heatmap).

- **Mosaad Ahmed Mohammed**
  - Predictive model for mini globe.
  - Globe rotation & tooltip logic.

- **Shreya Barki**
  - Sound integration (Howler.js).
  - UI controls & timeline animation.

- **Viraj Kishore Charakanam**
  - Dashboard layout & styling.
  - Leaflet Map & interactions.

- **Saad Ahmed Mohammed**
  - Brushing Technique for all the Visualizations.
  - Stats panel logic (average, most affected).
