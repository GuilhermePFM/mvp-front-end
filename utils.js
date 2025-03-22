const log_api_error = (response) =>{
    if (response.status === 400) {
        console.error('Bad request');
        // Handle bad request (e.g., invalid data)
      } else if (response.status === 401) {
        console.error('Unauthorized');
        // Handle unauthorized access
      } else if (response.status === 500) {
        console.error('Server error');
        // Handle server error
      } else {
        console.error(`Unexpected status code: ${response.status}`);
      }
}