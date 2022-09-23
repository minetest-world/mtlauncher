<script>
	export let seconds;

    function toReadableTime(time) {
        let res = '';
        let conversions = {
            year: 31536000,
			day: 86400,
			hour: 3600,
			minute: 60
		};

        for (const conv in conversions) {
            let timeframe = conversions[conv];

            if (time >= timeframe) {
                let ratio = time / timeframe;
                res += `${ratio.toFixed(0)} ${conv}${ratio >= 2 ? 's' : ''}, `;

                time %= timeframe;
			}
		}
        if ('' === res) return `${time} seconds`;

        return res;
	}
</script>

{toReadableTime(seconds)}