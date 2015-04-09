var botLoop;
var botPaused = true;
var botPurchasing = false;
var botFightingRandomBoss = false;
var botFightingGlobalBoss = false;
var botBuySlimes = false;
var botTickActivity = false;
var botGlobalBossTimer;

function mainLoop() {
  botTickActivity = false;

  if($('#popup').is(':visible')) {
    var botPopupTitle = $('#popup p[name="title"]').text();
    switch(botPopupTitle) {
      case 'Raid report':
        var botMessage = botBuildRaidReport($('#popup div[name="content"]'));
        console.log(botMessage);
        clickButton('CONTINUE');
        break;
      case 'SUMMON BOSS':
        clickButton('Summon Boss');
        break;
      case 'Are you sure?':
        clickButton('Activate Item');
        break;
      case 'ARE YOU SURE?':
      case 'CONFIRM PURCHASE':
        if(botPurchasing) {
          clickButton('Yes');
          botPurchasing = false;
        } else {
          clickButton('No');
        }
        break;
      case 'WHOOPS!':
      case 'BATTLE REPORT':
      case 'Battle Report':
      case 'ACTIVITY PASSED!':
      case 'SCENARIO #1':
      case 'Lobby Closed':
        clickButton('CONTINUE');
        break;
      default:
        console.log('Unknown popup: ' + botPopupTitle);
        break;
    }
  }

  //then, check to see if we need to do anything

  //RANDOM BOSS
  if(randomBossRefreshing() === true && botFightingRandomBoss === true) {
    botFightingRandomBoss = false;
  } else if(randomBossRefreshing() === false && botFightingRandomBoss === false) {
    clickSelector('#randomBossPortal a');
    botFightingRandomBoss = true;
  }

  //GLOBAL BOSS
  if(globalBossRefreshing() === true && botFightingGlobalBoss === true) {
    clearInterval(botGlobalBossTimer);
    botFightingGlobalBoss = false;
  } else if(globalBossRefreshing() === false && botFightingGlobalBoss === false) {
    clickSelector('span[name="timeRemaining"]:contains("JOIN") a');
    botGlobalBossTimer = setInterval(fightGlobalBoss, 250);
    botFightingGlobalBoss = true;
  }

  //ACTIVATE BUFFS
  if(inactiveBuffs()) {
    clickSelector('button:contains("Activate")');
  }

  //BUY SCIENTISTS
  if(haveBossCoins() && haveCheapLabor() && botPurchasing === false) {
    botPurchasing = true;
    clickSelector('button[name="hiremax_scientists"]');
  }

  //BUY SLIMES
  if(botBuySlimes === true && botPurchasing === false && haveTrillions(10)) {
    botPurchasing = true;
    clickSelector('button[name="buymax-knight"]');
  }
}

botToggle();

function botBuildRaidReport(message) {
  var botRaidUser = /You.? were raided by (.*?).? /.exec(message)[1];
  var botRaidSoldiers = /lost (.*?) soldiers/.exec(message)[1];
  var botRaidResult = (/won/.exec(message) !== null) ? 'won' : 'lost';
  var botRaidStolen = (/steal (.*?) from/.exec(message) !== null) ? /steal (.*?) from/.exec(message)[1] : '$0';

  return "RAIDED (" + botRaidUser + "): " + botRaidResult + "; lost: " + botRaidSoldiers + " and " + botRaidStolen;
}

function haveTrillions(trillions) {
  var botCurrency = $('#money_display').text();
  var botLowerLimit = trillions * 1000000000000;
  var botCurrencyInt = Number(botCurrency.replace(/[^0-9\.]+/g,""));
  if(botCurrencyInt > botLowerLimit) {
    return true;
  } else {
    return false;
  }
}

function haveBossCoins() {
  if($('#bc_display').text() != 0) {
    return true;
  } else {
    return false;
  }
}

function haveCheapLabor() {
 if($('span[name="scientists_price"]').text() == "1 BC") {
    return true;
 } else {
   return false;
 }
}

function inactiveBuffs() {
  if($('button:contains("Activate")').length > 0) {
    return true;
  } else {
    return false;
  }
}

function randomBossRefreshing() {
  if($('span[name="timer"]').is(':visible')) {
    return true;
  } else {
    return false;
  }
}

function globalBossRefreshing() {
  if($('span[name="timeRemaining"]:contains("min"), span[name="timeRemaining"]:contains("sec")').length > 0) {
    return true;
  } else {
    return false;
  }
}

function fightGlobalBoss() {
  if($('img[name="globalBossImg"]').is(':visible')) {
    $('img[name="globalBossImg"]').get(0).click();
  }
}

function clickButton(text) {
  $('#popup span button:contains("' + text + '")').get(0).click();
}

function clickSelector(selector) {
  $(selector).get(0).click();
}

function botToggle() {
  if(botPaused) {
    console.log('Playing bot');
    botLoop = setInterval(mainLoop, 1000);
    botPaused = false;
  } else {
    console.log('Pausing bot');
    clearInterval(botLoop);
    botPaused = true;
  }
}

function botToggleSlimes() {
  if(botBuySlimes) {
    console.log('Stopping slime purchases');
    botBuySlimes = false;
  } else {
    console.log('Starting slime purchases');
    botBuySlimes = true;
  }
}
