const body = document.querySelector('body');

const toggleModal = (modalSelector) => {
	const modal = document.querySelector(`.${modalSelector}`);
	modal.classList.add('active');
	body.classList.add('modal-opened');

	modal.querySelector('.close-modal').addEventListener('click', () => {
		modal.classList.remove('active');
		body.classList.remove('modal-opened');
	});
};

export { toggleModal };
