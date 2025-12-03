var sectionArray = [1, 2, 3, 4];

$.each(sectionArray, function(index, value){
          
     $(document).scroll(function(){
         var offsetSection = $('#' + 'section_' + value).offset().top - 154;
         var docScroll = $(document).scrollTop();
         var docScroll1 = docScroll + 1;
         
        
         if ( docScroll1 >= offsetSection ){
             $('.navbar-nav .nav-link').removeClass('active');
             $('.navbar-nav .nav-link:link').addClass('inactive');  
             $('.navbar-nav .nav-item .nav-link').eq(index).addClass('active');
             $('.navbar-nav .nav-item .nav-link').eq(index).removeClass('inactive');
         }
         
     });
    
    $('.click-scroll').eq(index).click(function(e){
        var offsetClick = $('#' + 'section_' + value).offset().top - 154;
        e.preventDefault();
        $('html, body').animate({
            'scrollTop':offsetClick
        }, 300)
    });
    
});

$(document).ready(function(){
    $('.navbar-nav .nav-item .nav-link:link').addClass('inactive');    
    $('.navbar-nav .nav-item .nav-link').eq(0).addClass('active');
    $('.navbar-nav .nav-item .nav-link:link').eq(0).removeClass('inactive');
});

// contact form


const form = document.querySelector(".contact-form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const status = document.createElement("p");
  status.style.marginTop = "10px";
  status.textContent = "⏳ Sending message...";
  form.appendChild(status);

  const data = new FormData(form);
  try {
    const response = await fetch(form.action, {
      method: form.method,
      body: data,
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      status.textContent = "✅ Message sent successfully! We'll get back to you soon.";
      status.style.color = "green";
      form.reset();
    } else {
      status.textContent = "❌ Oops! There was a problem sending your message.";
      status.style.color = "red";
    }
  } catch (error) {
    status.textContent = "⚠️ Network error. Please try again later.";
    status.style.color = "orange";
  }
});

