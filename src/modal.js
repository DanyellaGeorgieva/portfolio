const body = document.querySelector('body');
const modals = document.querySelectorAll('.modal');

const toggleModal = (modalSelector) => {
	const modal = document.querySelector(`.${modalSelector}`);
	for (let mdl of modals) {
		mdl.classList.remove('active');
	}
	modal.classList.add('active');
	body.classList.add('modal-opened');

	modal.querySelector('.modal-close-button').addEventListener('click', () => {
		modal.classList.remove('active');
		body.classList.remove('modal-opened');
	});
};

export { toggleModal };
