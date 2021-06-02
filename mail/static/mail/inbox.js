
document.addEventListener('DOMContentLoaded', function() {
  
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());

  document.querySelector('#compose-form').onsubmit = () => {
    compose_form()
  }
   
/*//Not working because buttons are loaded dynamically
//So they do not exist in the DOM at this point
  console.log(document.querySelectorAll('.mail'));

  document.querySelectorAll('.mail').forEach(button => {
    //button.addEventListener('click', load_mail(this.id));
    button.onclick = function() {
      load_mail(this.id);
    }
  });*/
  load_mailbox('inbox');
});

function archiving(id, val) {
  if (typeof val == "boolean"){
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: val
      })
    })
    //To wait the fetch is complete, if we remove those lines, sometimes load_mailbox still show the just archived mail
    .then(() => {
      load_mailbox('inbox');
    });
  }
}


function load_mail(id, notsent) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      //console.log(email)

      document.querySelector('#mail-view').innerHTML = `<div>
        <h2>${email.subject}</h2>
        <p>Sent by : ${email.sender}, the ${email.timestamp}</p>
        <p>Sent to : ${email.recipients}</p>
        <br >
        <p>${email.body}</p>
        </div>`;
        
      if (!email.read){
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        });
      }

      if(notsent === true){
        let archive = document.createElement('button');

        if(email.archived){
          archive.innerHTML = "Unarchive"
          archive.addEventListener('click', function() {
            archiving(email.id, false)
          });
        } else {
          archive.innerHTML = "Archive"
          archive.addEventListener('click', function() {
            archiving(email.id, true)
          });
        }
  
        document.querySelector('#mail-view').appendChild(archive)

        let reply = document.createElement('button');
        let subject = email.subject;

        if(! (subject.substring(0, 4) == 'Re: ')){
          subject = `Re: ${subject}`;
        }

        reply.innerHTML = "Reply"
        reply.addEventListener('click', function() {
          compose_email(email.sender, subject, `"On ${email.timestamp} ${email.sender} wrote :" \n${email.body}`)
        });

        document.querySelector('#mail-view').appendChild(reply)
      }
      
  });
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'block';
}

function compose_form() {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      //console.log(result);
      load_mailbox('sent');
  });
  return false;
}

function compose_email(recipients = '', subject = '', body = '') {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  
  // Fill or Clear out composition fields
  document.querySelector('#compose-recipients').value = recipients;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = body;
}

function load_mailbox(mailbox) {
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => { //emails = array of different email
      // Print emails
      //console.log(emails);

    emails.forEach(email => {
      const notsent = !(mailbox === 'sent');

      let mail = document.createElement('button');
      mail.className = 'mail';
      mail.style.width = '80%';
      mail.style.margin = '2px';
      
      mail.addEventListener('click', function() {
        load_mail(email.id, notsent)
      });

      if (!email.read){
        mail.style.background = 'lightgray';
      } else {
        mail.style.background = 'whitesmoke';
      }


      mail.innerHTML = `<div>
        <h4 style = 'float: left; width: 200px;'>${email.subject}</h4>
        <p style = 'float: left;'>Sent by : ${email.sender}</p>
        <p style = 'text-align:right; margin-right: 10px;'>${email.timestamp}</p>
        </div>`;

      document.querySelector('#emails-view').appendChild(mail);
    });
  });

  // Show the mailbox and hide other views
  document.querySelector('#mail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

