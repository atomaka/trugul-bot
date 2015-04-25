def player_style(player)
  "color:#{players[player]};font-weight: bold" if players.keys.include?(player)
end

def players
  {
    'greggnic' => '#3c763d',
    'atomaka' => '#31708f',
    'mafiaman' => '#a94442'
  }
end

def money_style(value)
  value.to_f < 0 ? 'color:#a94442' : 'color:#3c763d'
end

def readable_number(value)
  if value.to_f < 0
    negative = true
    value *= -1 if value < 0
  else
    negative = false
  end

  numbers.each do |number, symbol|
    if value.to_f / number.to_f >= 1
      new_value = negative ? '-' : ''
      new_value += sprintf('%.2f', value.to_f / number.to_f) + '<strong>' + symbol + '</strong>'
      return new_value
    end
  end

  value = 0.0 unless value
  return sprintf('%.2f', value) + "&nbsp;"
end

def numbers
  {
    '1000000000000000' => 'Q',
    '1000000000000' => 'T',
    '1000000000' => 'B',
    '1000000' => 'M',
    '1000' => 'K'
  }
end
