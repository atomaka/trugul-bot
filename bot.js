function startClickers() {
  delayClick('#randomBossPortal a', 10);
  delayClick('#popup span button:contains("Summon Boss")', 1);
  delayClick('#popup span button:contains("CONTINUE")', 1);
}

function delayClick(selector, seconds) {
  var waiting = setInterval(
    function() {
      if ($(selector).length > 0) {
        $(selector).get(0).click();
      }
    },
    seconds * 1000
  )
}

startClickers();
