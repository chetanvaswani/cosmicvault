export default function myAlert(message, time = 2500){
    let alertDiv = document.querySelector('.alert-div');
    alertDiv.classList.remove('hidden')
    alertDiv.innerHTML = message

    setTimeout(() => {
        alertDiv.classList.add('hidden')
        alertDiv.innerHTML = ''
    }, time)
}