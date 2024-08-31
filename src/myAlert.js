export default function myAlert(message){
    let alertDiv = document.querySelector('.alert-div');
    alertDiv.classList.remove('hidden')
    alertDiv.innerHTML = message

    setTimeout(() => {
        alertDiv.classList.add('hidden')
        alertDiv.innerHTML = ''
    }, 2500)
}