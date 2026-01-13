import os
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# Define the file to upload and the folder in Google Drive where you want to store it
file_path = 'output.pdf'
drive_folder_id = '1vqlwzvfvUS3TiyUxc2VDi-LfP6k_7JP5'  # Replace with the actual folder ID in Google Drive

# Check if 'token.json' already exists
if os.path.exists('token.json'):
    creds = Credentials.from_authorized_user_file('token.json')
else:
    # Define the scopes you need for your application
    SCOPES = ['https://www.googleapis.com/auth/drive.file']

    # Load OAuth credentials from 'oauth.json'
    flow = InstalledAppFlow.from_client_secrets_file('oauth.json', SCOPES)

    # Run the OAuth2 authentication flow
    creds = flow.run_local_server(port=0)

    # Save the obtained credentials to 'token.json' for future runs
    with open('token.json', 'w') as token_file:
        token_file.write(creds.to_json())

# Build the Google Drive API service
service = build('drive', 'v3', credentials=creds)

# Create a media upload request
media = MediaFileUpload(file_path, mimetype='application/pdf')

# Create the file metadata
file_metadata = {
    'name': 'output.pdf',
    'parents': [drive_folder_id]
}

# Upload the file
file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()

# Print the file ID of the uploaded file
print(f'File ID: {file.get("id")}')

