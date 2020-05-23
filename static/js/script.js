$(document).ready(function()  {
  $('#example1').click(function()  {
    $('#tabs > li').removeClass('is-active');
    $(this).parent().addClass('is-active');
    $("#sentence1").val("Hebden Bridge is a popular place to live.");
    $("#sentence2").val("Space is limited due to the steep valleys and lack of flat land.");
  });
  
  $('#example2').click(function()  {
    $('#tabs > li').removeClass('is-active');
    $(this).parent().addClass('is-active');
    $("#sentence1").val("As a consequence, three ministers resigned.");
    $("#sentence2").val("Prime Minister Horn won the majority of the Socialists behind himself.");
  });
  
  $('#example3').click(function()  {
    $('#tabs > li').removeClass('is-active');
    $(this).parent().addClass('is-active');
    $("#sentence1").val("In 1997, the College again made a name change to Petit Jean College.");
    $("#sentence2").val("In 2001, Petit Jean College merged with the University of Arkansas System and became the College at Morrilton.");
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
        $('#header-message').addClass("is-success");
        $('#header-message').text("Successfully Initialized");
        $('#header-message').show();
        updateConnectiveList(data);
        $('#prediction-section').show();
      },
      complete: function() { $('#model-1').removeClass("is-loading"); },
      error: function() { 
        console.log("Failed Model 1 Init"); 
        $('#header-message').addClass("is-danger");
        $('#header-message').text("Failed to Initialize");
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
        $('#header-message').addClass("is-danger");
        $('#header-message').text("Failed to Initialize");
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
  console.log(connectives);
  connectives.forEach(element => {
    container.append(`<span class="tag">${element}</span>`);
  });
  $('#connective-tags').html(container);
}