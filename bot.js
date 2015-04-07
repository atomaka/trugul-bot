var activeTimers = [];

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

function play() {
  activeTimers.push(delayClick('#popup span button:contains("Summon Boss")', 3));
  activeTimers.push(delayClick('#popup span button:contains("CONTINUE")', 3));
  activeTimers.push(delayClick('#randomBossPortal a', 20));
  activeTimers.push(delayClick('span[name="timeRemaining"]:contains("JOIN") a', 80));

  var globalBossTimer = setInterval(function() {
    if($('img[name="globalBossImg"]').is(':visible')) {
      $('img[name="globalBossImg"]').get(0).click();
    }
  }, 1000);

  var activateTimer = setInterval(function() {
    if($('button:contains("Activate")')) {
      $('button:contains("Activate")').get(0).click();
      setTimeout(function() {
        $('button:contains("Activate Item")').get(0).click();
      }, 250);
    }
  }, 10000);

  var scientistTimer = setInterval(function() {
    if($('span[name="scientists_price"]').text() == "1 BC") {
      $('button[name="hiremax_scientists"]').get(0).click();
      setTimeout(function() {
        $('button:contains("Yes")').get(0).click();
      }, 250);
    }
  }, 20000);

  activeTimers.push(globalBossTimer);
  activeTimers.push(activateTimer);
  activeTimers.push(scientistTimer);
}

function pause() {
  for(var i = 0; i < activeTimers.length; i++) {
    clearInterval(activeTimers[i]);
  }
}

function botRaid(username) {
  $('button:contains("Raid")').get(0).click();
  $('input[name="raid_user"]').val(username);
  $('button:contains("Raid!")').get(0).click();
}

function buySlimes() {
  var slimeTimer = setInterval(function() {
    $('button[name="buymax-knight"]').get(0).click();
    setTimeout(function() {
      $('button:contains("Yes")').get(0).click();
    }, 250);
  }, 60000);
  activeTimers.push(slimeTimer);
}
