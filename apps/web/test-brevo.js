const brevo = require('@getbrevo/brevo');
console.log("Keys exported by @getbrevo/brevo:");
console.log(Object.keys(brevo));
if (brevo.ApiClient) {
    console.log("ApiClient exists");
} else {
    console.log("ApiClient does NOT exist");
}
