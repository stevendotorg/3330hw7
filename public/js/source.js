$(function () {
    $("#dashboardTabs").tabs();

    $("#accordion").accordion({
        heightStyle: "content"
    });

    $("#customerDialog").dialog({
        autoOpen: false,
        modal: true,
        width: 400
    });

    $("#newCustomerButton").on("click", function () {
        $("#customerDialog").dialog("open");
    });

    $("#customerDate").datepicker();
});