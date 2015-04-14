var botUsers = ['atomaka','greggnic'];
var botLoop;
var botGlobalBossTimer;
var botPaused = true;
var botPurchasing = false;
var botRaiding = false;
var botFightingRandomBoss = false;
var botFightingGlobalBoss = false;
var botBuySlimes = false;
var botFightGlobal = true;
var botFightRandom = true;
var botRaidTarget = null;
var botLastRandom = 0;
var botLastRaid = 0;
var botSleeping = false;

function mainLoop() {
  if($('#popup').is(':visible')) {
    var botPopupTitle = $('#popup p[name="title"]').text();
    switch(botPopupTitle) {
      case 'Raid report':
        var botMessage = botBuildRaidReport($('#popup div[name="content"]').text());
        console.log(botMessage);
        botLastRaid = botTimestamp();
        clickButton('CONTINUE');
        break;
      case 'SUMMON BOSS':
        clickButton('Summon Boss');
        botLastRandom = botTimestamp();
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
      case 'Raid':
        if(haveRaidTarget() === true) {
          if(botRaiding) {
            clickButton('Raid!');
            botRaiding = false;
          } else {
            clickButton('Nevermind');
          }
        }
        break;
      case 'WHOOPS!':
      case 'BATTLE REPORT':
      case 'Battle Report':
      case 'ACTIVITY PASSED!':
      case 'SCENARIO #1':
      case 'Lobby closed':
      case 'Wait':
      case 'ACTIVITY FAILED!':
      case 'Game in progress':
      case 'User not found':
        clickButton('CONTINUE');
        break;
      default:
        console.log('Unknown popup: ' + botPopupTitle);
        break;
    }
  } else {
    //RANDOM BOSS
    if(randomBossRefreshing() === true && botFightingRandomBoss === true && botFightingGlobalBoss === false && haveSoldiers() && botFightRandom === true)  {
      botFightingRandomBoss = false;
    } else if(randomBossRefreshing() === false && botFightingRandomBoss === false) {
      clickSelector('#randomBossPortal a');
      botFightingRandomBoss = true;
    } else if(botTimestamp() > botLastRandom + 180) {
      clickSelector('#randomBossPortal a');
      botFightingRandomBoss = true;
    }

    //GLOBAL BOSS
    if(globalBossRefreshing() === true && botFightingGlobalBoss === true) {
      clearInterval(botGlobalBossTimer);
      botFightingGlobalBoss = false;
    } else if(globalBossRefreshing() === false && botFightingGlobalBoss === false && botFightGlobal === true) {
      clickSelector('span[name="timeRemaining"]:contains("JOIN") a');
      botGlobalBossTimer = setInterval(fightGlobalBoss, 250);
      botFightingGlobalBoss = true;
    }

    //ACTIVATE BUFFS
    if(inactiveBuffs()) {
      clickSelector('button:contains("Activate")');
    }

    //BUY SCIENTISTS
    if(haveBossCoins() && haveCheapLabor()) {
      botPurchasing = true;
      clickSelector('button[name="hiremax_scientists"]');
    }

    //RAID
    if(raidRefreshing() === false && haveRaidTarget() === true && internalRaidRefreshing() === false) {
      clickSelector('button[name="raid_button"]');
      botFillIn('input[name="raid_user"]', botRaidTarget);
      botRaiding = true;
    }

    //BUY SLIMES
    if(botBuySlimes === true && haveTrillions(10) && botPurchasing === false) {
      botPurchasing = true;
      clickSelector('button[name="buymax-knight"]');
    }
  }
}

botToggle();

function internalRaidRefreshing() {
  if(botTimestamp() > botLastRaid + 300) {
    return false;
  } else {
    return true;
  }
}

function haveSoldiers() {
  if(convertToNumber($('tr[name="knight"] > .owned').text()) == 0) {
    return false;
  } else if(convertToNumber($('tr[name="advknight"] > .owned').text()) == 0) {
    return false;
  } else {
    return true;
  }
}

function chatMonitor() {
  $('#chatbox, #groupchatbox').bind('DOMSubtreeModified', function() {
    var lastMessage = $(this).find('.chat-message').last();
    if(chatIsPM(lastMessage) || chatHasName(lastMessage)) {
      var user = lastMessage.find('.username').text().trim();
      var content = lastMessage.find('.message').text().trim();
      console.log('CHAT (' + user + '): ' + content);
    }
  });
}

function chatIsPM(message) {
  return message.find('.chat-pm').length > 0;
}

function chatHasName(message) {
  var string = message.find('.message').text();
  return (new RegExp( '\\b' + botUsers.join('\\b|\\b') + '\\b')).test(string) === true;
}

function botTimestamp() {
  return Math.floor(Date.now() / 1000);
}

function botFillIn(selector, text) {
  $(selector).val(text);
}

function raidRefreshing() {
  if($('span[name="raidtime"]').css('display') == 'none') {
    return false;
  } else {
    return true;
  }
}

function haveRaidTarget() {
  if(botRaidTarget == null) {
    return false;
  } else {
    return true;
  }
}

function botBuildRaidReport(message) {
  var botRaidUser;
  if(/You.? were raided by (.*?).? /.exec(message)) {
    botRaidUser = /You.? were raided by (.*?).? /.exec(message)[1];
  } else {
    botRaidUser = /You .*? the raid against (.*?)! /.exec(message)[1];
  }
  var botRaidSoldiers = /! .*? lost (.*?) soldiers/.exec(message)[1];
  var botRaidResult = (/won/.exec(message) !== null) ? 'won' : 'lost';
  var botRaidStolen = (/steal (.*?) from/.exec(message) !== null) ? /steal (.*?) from/.exec(message)[1] : '$0';

  return "RAIDED (" + botRaidUser + "): " + botRaidResult + "; soldiers: -" + botRaidSoldiers + "; " + botRaidResult + " money: " + botRaidStolen;
}

function haveTrillions(number) {
  if(convertToNumber($('#money_display').text()) > trillions(number)) {
    return true;
  } else {
    return false;
  }
}

function convertToNumber(string) {
  return Number(string.replace(/[^0-9\.]+/g, ''));
}

function trillions(number) {
  return number * 1000000000000;
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

function botSetTarget(username) {
  botRaidTarget = username;
}

function botClearTarget() {
  botRaidTarget = null;
}

function botToggle() {
  if(botPaused) {
    console.log('Playing bot');
    botLoop = setInterval(mainLoop, 1000);
    chatMonitor();
    botPaused = false;
  } else {
    console.log('Pausing bot');
    clearInterval(botLoop);
    $('#chatbox, #groupchatbox').unbind('DOMSubtreeModified');
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

function botToggleGlobal() {
  if(botFightGlobal) {
    console.log('Stopping global fighting');
    botFightGlobal = false;
  } else {
    console.log('Starting global fighting');
    botFightGlobal = true;
  }
}

function botToggleRandom() {
  if(botFightRandom) {
    console.log('Stopping random fighting');
    botFightRandom = false;
  } else {
    console.log('Starting random fighting');
    botFightRandom = true;
  }
}

function botToggleUI() {
  clickSelector('a[name="portal"]');
  clickSelector('button[name="vault_hide"]');
  $('a[name="bossPortal"] > img').toggle();
}

function botToggleSleep() {
  if(botSleeping) {
    botFightRandom = true;
    botFightGlobal = true;
    botSleeping = false;
  } else {
    botFightRandom = false;
    botFightGlobal = false;
    botBuySlimes = false;
    botSleeping = true;
  }
}

function botHelp() {
  console.log('bt(): Toggle for the entire bot.');
  console.log('bs(): Toggle "sleep mode." Disables all actions, but logs raids and chat.');
  console.log('bts(): Toggle auto-slime purchasing.');
  console.log('btu(): Toggle the UI (probably only works once).');
  console.log('btg(): Toggle the global boss.');
  console.log('btr(): Toggle the random boss.');
  console.log('bst("username"): Set a target to raid every 5 minutes.');
  console.log('bct(): Clear the raid target.');
}

function bt() { botToggle(); }
function bs() { botToggleSleep(); }
function bts() { botToggleSlimes(); }
function btu() { botToggleUI(); }
function btg() { botToggleGlobal(); }
function btr() { botToggleRandom(); }
function bst(username) { botSetTarget(username); }
function bct() { botClearTarget(); }
