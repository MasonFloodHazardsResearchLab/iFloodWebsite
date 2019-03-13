$.get("https://data.iflood.vse.gmu.edu/Forecast/ChesapeakeBay_ADCIRCSWAN/recent.txt?v="+Math.round(Math.random()*100000000).toString(), function(recentRun) {
    $.get("https://data.iflood.vse.gmu.edu/Forecast/ChesapeakeBay_ADCIRCSWAN/"+recentRun+"/meta.json", function(data) {
        console.log(data);
        $('.statInsert .statBox').each(function() {
            let level = data[this.dataset.system]['SKILL'];
            let number = $(this).find('.number');
            number.text(0);
            //animate number
            let progress = 0;
            let interval = setInterval(function() {
                progress += 1.8;
                if (progress >= level) {
                    number.text(level);
                    clearInterval(interval);
                }
                else {
                    number.text((progress).toFixed(1));
                }
            },10);
            if (level > 90)
                number.addClass('good');
            else if (level > 80)
                number.addClass('moderate');
            else
                number.addClass('bad');
        })
    });
});