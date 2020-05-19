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