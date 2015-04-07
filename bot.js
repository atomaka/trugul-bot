var globalBossTracker;

function delayClick(selector, seconds) {
  var timer = setInterval(
    function() {
      if($(selector).length > 0) {
        $(selector).get(0).click();
      }
    },
    seconds * 1000
  );

  return timer;
}

delayClick('#popup span button:contains("Summon Boss")', 3);
delayClick('#popup span button:contains("CONTINUE")', 3);
delayClick('#randomBossPortal a', 20);
delayClick('span[name="timeRemaining"]:contains("JOIN") a', 80);

setInterval(function() {
  if($('img[name="globalBossImg"]').is(':visible')) {
    $('img[name="globalBossImg"]').get(0).click();
  }
}, 1000);
