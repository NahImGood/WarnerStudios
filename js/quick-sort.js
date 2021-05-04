// shows the chart used for visuallizing data
var currentChart; // Global for the current chart
var arraySize; // Size of the array
var array; //  array holding the values being sorted
var stopSort = false; // boolean for knowing when to stop the sort in the middle of a sort Algorithm
var sortSpeed; // how fast the sorting will visual appear
var graphType = 'bar'; // type of graph being used in the chart.js
var sortRunning = false; // if the sort is currently running

// on load set array size, arrray speed and build the inital chart in the canvas view
$( document ).ready(function() {
  arraySize = $("#myRange").val();
  sortSpeed = $("#mySpeed").val();
  array = createArray(arraySize);
  buildChart(array, arraySize);
});

// Bubble Sort //
// Classic bubble sort but with small modifications to visually show the updates
async function bubbleSort(){
  sortRunning = true; // for terminating sort method when its running
  stopSort = false;   // set stopSort init value
  let len = array.length;
    for (let i = 0; i < len; i++) {
        for (let j = 0; j < len; j++) {
            if (array[j] > array[j + 1]) {
                // start swapping values in place
                let tmp = array[j];
                array[j] = array[j + 1];
                updateChartValue(j, array[j + 1]);
                array[j + 1] = tmp;
                updateChartValue(j + 1, tmp);
                // stops the code in case someone has clicked the stop button.
                if(stopSort){stopSort = false; return;}
                await sleep(sortSpeed);
            }
        }
    }
}

// Selection Sort //
// just as bad as the bubble sort but another method of sorting
async function selectionSort(){
  sortRunning = true; // for terminating sort method when its running
  let len = array.length;
    for (let i = 0; i < len; i++) {
        let min = i;
        for (let j = i + 1; j < len; j++) {
            if (array[min] > array[j]) {
                min = j;
            }
        }
        if (min !== i) {
            let tmp = array[i];
            array[i] = array[min];
            updateChartValue(i, array[min]);
            array[min] = tmp;
            updateChartValue(min, tmp);
            if(stopSort) {stopSort = false; return;}
            await sleep(sortSpeed);
        }
    }
}

// Quick sort //
// Fastest methog of sorting shown here. Uses recussion
async function quickSort(items, left, right) {
  console.log(stopSort);
    var index;
    if (items.length > 1) {
      var pivot   = items[Math.floor((right + left) / 2)], //middle element
          index   = left, //left pointer
          j       = right; //right pointer
      while (index <= j) {
          while (items[index] < pivot) {
              index++;
          }
          while (items[j] > pivot) {
              j--;
          }
          if (index <= j) {
            //swap(items, index, j); //swap two elements
              var temp = items[index];
              items[index] = items[j];
              updateChartValue(index, items[j]);
              items[j] = temp;
              updateChartValue(j, temp);
              await sleep(sortSpeed);
              index++;
              j--;
              if(stopSort){stopSort = false; return;}
          }
      }
        if (left < index - 1) { //more elements on the left side of the pivot
            quickSort(items, left, index - 1);
        }
        if (index < right) { //more elements on the right side of the pivot
            quickSort(items, index, right);
        }
    }
    return items;
}

// Method to pass the needed items into quicksort
// form the button element
function callQuickSort(){
  var left = 0;
  var right = array.length - 1;
  quickSort(array, left, right);
}

// when the stop button is pressed it sets the stopsort to true
// but only if there is a current sort running. Otherwise you will
// stop the sort instantly when the next sort is selected
function stopSorting(){
  if(sortRunning){
      stopSort = true;
  }
}

// Forces the sort method to hault
function hardStop(){
  stopSort = true;
}

// used to update values on the chart js in all sorting methods
function updateChartValue(index, number) {
    currentChart.data.datasets[0].data[index] = number;
    currentChart.data.labels[index] = number;
    currentChart.update();
}

// Will update the array in the chart
async function updateChartSize(size){
  array = createArray(size);
  buildChart(array, arraySize);
}

// intially creates the array and then shuffles it.
function createArray(arraySize){
  for (var array=[],i=0;i<arraySize;++i) array[i]=i;
  array = shuffleArray(array);
  return array;
}

// shuffles the array to random, Used when clicking on the button to shuffle data
function shuffleData(){
  buildChart(shuffleArray(array), arraySize);
}

// shuffles the array to random locations
function shuffleArray(array){
  var tmp, current, top = array.length;
  if(top) while(--top) {
    current = Math.floor(Math.random() * (top + 1));
    tmp = array[current];
    array[current] = array[top];
    array[top] = tmp;
  }
  console.log(array);
  return array;
}

// builds a new chart when the chart button type is selected from the html buttons
// each buttons passes a string value for the type of chart
function updateGraphType(newType){
  graphType = newType;
  buildChart(array, arraySize);
}

// function for building charts
async function buildChart(data, arraySize){
    hardStop(); //  used to stop the chart form sorting.
    var ctx = document.getElementById('myChart').getContext('2d');
    var myColors=[]; // sets init array for filling with colors.
    var label = data; // label and data are copys because some maps dont need labels
                      // the look bad with the labels, To busy looking

  // Sets colors to the color array so each bar has a uniq color
  $.each(data, function( index,value ) {
    	 myColors[index]= toColor(-value * 10000000);
  });
  // if there is a chart already built we need to remove it
  // so there arent artifacts when hovering over the data.
  if(currentChart){ currentChart.destroy(); }
  // chart type looks bad with data values.
  if(graphType == 'polarArea'){ label = '';  }

  currentChart = new Chart(ctx, {
    type: graphType,
    data: {
        labels: label,
        datasets: [{
            label: 'Sorting Is Fun',
            backgroundColor: myColors,
            data: data,
            borderWidth: 1
        }]
    },
    responsive : true,
    options: {
          legend: {
            display: false
          },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }
  });
  if(stopSort){
    await sleep(sortSpeed);
    stopSort = false;
  }
}

// creates the color for the charts
function toColor(num) {
    num >>>= 0;
    var b = num & 0xFF,
        g = (num & 0xFF00) >>> 8,
        r = (num & 0xFF0000) >>> 16,
        a = ( (num & 0xFF000000) >>> 24 ) / 255 ;
    return "rgba(" + [r, g, b, a].join(",") + ")";
}

// pauses so the chart can update and controll the speed
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
