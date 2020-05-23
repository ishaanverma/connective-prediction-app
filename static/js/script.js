$(document).ready(function()  {
  var example1 = ["", ""];
  var example2 = ["", ""];
  var example3 = ["", ""];

  $('#example1').click(function()  {
    $('#tabs > li').removeClass('is-active');
    $(this).parent().addClass('is-active');
    $("#sentence1").val(example1[0]);
    $("#sentence2").val(example1[1]);
  });
  
  $('#example2').click(function()  {
    $('#tabs > li').removeClass('is-active');
    $(this).parent().addClass('is-active');
    $("#sentence1").val(example2[0]);
    $("#sentence2").val(example2[1]);
  });
  
  $('#example3').click(function()  {
    $('#tabs > li').removeClass('is-active');
    $(this).parent().addClass('is-active');
    $("#sentence1").val(example3[0]);
    $("#sentence2").val(example3[1]);
  });

  $('.card-toggle').click(function()   {
    $('.card-toggle').parent().parent().find('.card-content').toggleClass('is-hidden');
  });

  $('#model-1').click(function()  {
    $('#prediction-section').hide();
    $('#model-tabs > li').removeClass("is-active");
    $(this).parent().addClass("is-active");
    $('#header-message').hide();
    $.get({
      url: "/model",
      data: { modelNum: 1},
      beforeSend: function() { $('#model-1').addClass('is-loading'); },
      success: function(data, status, xhr) { 
        console.log("Initialized Model 1"); 
        $('#header-message').removeClass("is-danger");
        $('#header-message').addClass("is-success");
        $('#header-message').text("Successfully Initialized");
        $('#header-message').show();
        updateConnectiveList(data);
        $('#prediction-section').show();
      },
      complete: function() { $('#model-1').removeClass("is-loading"); },
      error: function() { 
        console.log("Failed Model 1 Init"); 
        $('#header-message').removeClass("is-success");
        $('#header-message').addClass("is-danger");
        $('#header-message').text("Failed to Initialize");
        $('#header-message').show();
      }
    });
  });

  $('#model-2').click(function()  {
    $('#prediction-section').hide();
    $('#model-tabs > li').removeClass("is-active");
    $(this).parent().addClass("is-active");
    $('#header-message').hide();
    $.get({
      url: "/model",
      data: { modelNum: 2},
      beforeSend: function() { $('#model-2').addClass('is-loading'); },
      success: function(data, status, xhr) { 
        console.log("Initialized Model 2"); 
        $('#header-message').removeClass("is-danger");
        $('#header-message').addClass("is-success");
        $('#header-message').text("Successfully Initialized");
        $('#header-message').show();
        updateConnectiveList(data);
        $('#prediction-section').show(); 
      },
      complete: function() { $('#model-2').removeClass("is-loading"); 
    },
      error: function() { 
        console.log("Failed Model 2 Init"); 
        $('#header-message').removeClass("is-success");
        $('#header-message').addClass("is-danger");
        $('#header-message').text("Failed to Initialize");
        $('#header-message').show();
      }
    });
  });
});

function showPredictedConnectives(data, status, xhr) {
  results = data["predictions"];
  values = data["values"];
  console.log(values);
  $('#predictionPanels > .panel-block').each(function(index)  {
    $(this).html(`<span>${results[index]}</span> <span class="tag is-medium is-pulled-right">${values[index].toFixed(3)}</span>`);
  });
}

$('#connectivePredict').submit(function(event)  {
  event.preventDefault();
  var form = $(this);
  var url = form.attr('action');

  $.get({
    url: url,
    data: form.serialize(),
    beforeSend: function() { $('#submitForm').addClass("is-loading"); },
    success: showPredictedConnectives,
    complete: function() { $('#submitForm').removeClass("is-loading"); },
  });
})

function updateConnectiveList(data)  {
  connectives = data["connectives"];
  container = $("<span></span>");
  connectives.forEach(element => {
    container.append(`<span class="tag">${element}</span>`);
  });
  $('#connective-tags').html(container);
}

function updateExamplesList(data) {
  examples = data["examples"];
  example1 = examples[0];
  example2 = examples[1];
  example3 = examples[2];
}