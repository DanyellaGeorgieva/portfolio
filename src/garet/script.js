import '../style.css';

const slider1 = document.getElementById('slide-1');
const slider2 = document.getElementById('slide-2');
const slider3 = document.getElementById('slide-3');
const slider4 = document.getElementById('slide-4');
const slider5 = document.getElementById('slide-5');
const segment1 = document.getElementById('slide-segment1');
const segment2 = document.getElementById('slide-segment2');
const segment3 = document.getElementById('slide-segment3');
const segment4 = document.getElementById('slide-segment4');
const segment5 = document.getElementById('slide-segment5');

slider1.addEventListener('input', () => {
  segment1.style.fontVariationSettings = `'ital' 0, 'wght' ${slider1.value}`;
});

slider2.addEventListener('input', () => {
  segment2.style.fontVariationSettings = `'ital' 0, 'wght' ${slider2.value}`;
});

slider3.addEventListener('input', () => {
  segment3.style.fontVariationSettings = `'ital' 0, 'wght' ${slider3.value}`;
});

slider4.addEventListener('input', () => {
  segment4.style.fontVariationSettings = `'ital' ${slider4.value}, 'wght' 500`;
});

slider5.addEventListener('input', () => {
  segment5.style.fontVariationSettings = `'ital' 0, 'wght' ${slider5.value}`;
});