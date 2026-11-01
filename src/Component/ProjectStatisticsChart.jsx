

import Chart from "react-apexcharts";

function ProjectStatisticsChart() {

  // Project status data
  const projectData = {
    upcoming: 4,
    ongoing: 10,
    onHold: 2,
    completed: 8,
  };

  const totalProjects =
    projectData.upcoming +
    projectData.ongoing +
    projectData.onHold +
    projectData.completed;


  // Donut chart settings
  const options = {

    chart: {
      type: "donut",
      toolbar: {
        show: false,
      },
    },

    labels: [
      "Upcoming",
      "Ongoing",
      "On Hold",
      "Completed",
    ],

    colors: [
      "#DDE8E1",
      "#183B2A",
      "#B8C6BC",
      "#7D9A87",
    ],

    legend: {
      show: false,
    },

    dataLabels: {
      enabled: false,
    },

    stroke: {
      width: 5,
      colors: ["#FFFFFF"],
    },

    plotOptions: {

      pie: {

        expandOnClick: false,

        donut: {

          size: "72%",

          labels: {

            show: true,

            name: {
              show: true,
              color: "#7B857F",
              fontSize: "12px",
              fontWeight: 600,
            },

            value: {
              show: true,
              color: "#183B2A",
              fontSize: "28px",
              fontWeight: 800,

              formatter: function () {
                return totalProjects;
              },
            },

            total: {
              show: true,
              showAlways: true,

              label: "Total Projects",

              color: "#7B857F",
              fontSize: "12px",
              fontWeight: 600,

              formatter: function () {
                return totalProjects;
              },
            },

          },

        },

      },

    },

    tooltip: {

      y: {

        formatter: function (value) {
          return `${value} Projects`;
        },

      },

    },

    responsive: [

      {
        breakpoint: 768,

        options: {

          chart: {
            height: 300,
          },

        },

      },

      {
        breakpoint: 480,

        options: {

          chart: {
            height: 270,
          },

        },

      },

    ],

  };


  // Chart values
  const series = [
    projectData.upcoming,
    projectData.ongoing,
    projectData.onHold,
    projectData.completed,
  ];


  return (

    <div className="project-statistics-chart">

      {/* Chart */}
      <Chart
        options={options}
        series={series}
        type="donut"
        height={330}
      />


      {/* Status Legend */}
      <div className="project-statistics-legend">

        {/* Upcoming */}
        <div className="project-statistics-item">

          <div className="project-statistics-item-left">

            <span
              className="project-statistics-dot"
              style={{ backgroundColor: "#DDE8E1" }}
            ></span>

            <span>
              Upcoming
            </span>

          </div>

          <strong>
            {projectData.upcoming}
          </strong>

        </div>


        {/* Ongoing */}
        <div className="project-statistics-item">

          <div className="project-statistics-item-left">

            <span
              className="project-statistics-dot"
              style={{ backgroundColor: "#183B2A" }}
            ></span>

            <span>
              Ongoing
            </span>

          </div>

          <strong>
            {projectData.ongoing}
          </strong>

        </div>


        {/* On Hold */}
        <div className="project-statistics-item">

          <div className="project-statistics-item-left">

            <span
              className="project-statistics-dot"
              style={{ backgroundColor: "#B8C6BC" }}
            ></span>

            <span>
              On Hold
            </span>

          </div>

          <strong>
            {projectData.onHold}
          </strong>

        </div>


        {/* Completed */}
        <div className="project-statistics-item">

          <div className="project-statistics-item-left">

            <span
              className="project-statistics-dot"
              style={{ backgroundColor: "#7D9A87" }}
            ></span>

            <span>
              Completed
            </span>

          </div>

          <strong>
            {projectData.completed}
          </strong>

        </div>

      </div>

    </div>

  );
}

export default ProjectStatisticsChart;
