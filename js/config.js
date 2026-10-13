/* Site settings.
 * inkApi: the /exec URL of the Apps Script in backend/Code.gs. Empty = live sharing is off and every device can write
 * (ink is only saved on that device). Once it's set, only a device signed in with the teacher key can write; everyone
 * else sees the teacher's notes for their class link (?class=B), view only. */
export const CONFIG = {
  inkApi: '',
  classes: ['A', 'B', 'C', 'D'],
  classLabel: (c) => (/^[A-D]$/.test(c) ? 'Block ' + c : c)
};
