$(document).ready(function () {
    const tabs = document.querySelectorAll('[role="tab"]');
    const tabList = document.querySelector('[role="tablist"]');

    tabs.forEach(function (tab) {
        tab.addEventListener("click", changeTabs);
    });

    let tabFocus = 0;

    tabList.addEventListener("keydown", (e) => {
        if (e.keyCode === 39 || e.keyCode === 37) {
            tabs[tabFocus].setAttribute("tabindex", -1);
            if (e.keyCode === 39) {
                tabFocus++;
                if (tabFocus >= tabs.length) {
                    tabFocus = 0;
                }
            } else if (e.keyCode === 37) {
                tabFocus--;
                if (tabFocus < 0) {
                    tabFocus = tabs.length - 1;
                }
            }

            tabs[tabFocus].setAttribute("tabindex", 0);
            tabs[tabFocus].focus();
        }
    });
});

function changeTabs(e) {
    const target = e.target;
    const parent = target.parentNode;
    const grandparent = parent.parentNode;

    parent.querySelectorAll('[aria-selected="true"]').forEach((t) => t.setAttribute("aria-selected", false));

    target.setAttribute("aria-selected", true);

    grandparent.querySelectorAll('[role="tabpanel"]').forEach((p) => p.setAttribute("hidden", true));

    grandparent.parentNode.querySelector(`#${target.getAttribute("aria-controls")}`).removeAttribute("hidden");
}

function loadSearchTab(parsed_dict) {
    const target = document.getElementById("search_routes");
    const parent = target.parentNode;
    const grandparent = parent.parentNode;

    // Add the value and text of the source and destination to the form fields
    document.getElementById("id_source").value = parsed_dict.source_name;
    document.getElementById("id_source").innerText = parsed_dict.source_location;
    document.getElementById("id_destination").value = parsed_dict.destination_name;
    document.getElementById("id_destination").innerText = parsed_dict.destination_location;

    $("#scroll_container").hide();

    parent.querySelectorAll('[aria-selected="true"]').forEach((t) => t.setAttribute("aria-selected", false));

    target.setAttribute("aria-selected", true);

    grandparent.querySelectorAll('[role="tabpanel"]').forEach((p) => p.setAttribute("hidden", true));

    grandparent.parentNode.querySelector(`#${target.getAttribute("aria-controls")}`).removeAttribute("hidden");
}

// Change tabs font-size if required on load of the document
$(document).ready(function () {
    if ($("#tabs").width() > $("#header").width()) {
        $(".tab").css("font-size", "16px");
    } else {
        $(".tab").css("font-size", "20px");
    }
});

// Change tabs font-size if required on resize of the window
$(window).resize(function () {
    if ($("#tabs").width() > $("#header").width()) {
        $(".tab").css("font-size", "16px");
    }
});
