from google.oauth2 import service_account
from googleapiclient.discovery import build

# Authenticate using the service account JSON key
credentials = service_account.Credentials.from_service_account_file(
    'credentials.json',  # Replace with your JSON key file
    scopes=['https://www.googleapis.com/auth/drive']
)

# Create a Google Drive API client
drive_service = build('drive', 'v3', credentials=credentials)

# Specify the folder name you want to search for
folder_name = 'appsheet'

# Search for the folder by name
results = drive_service.files().list(
    q=f"name = '{folder_name}' and mimeType = 'application/vnd.google-apps.folder'",
    fields="files(id, name)"
).execute()

# Extract the folder ID if it exists
if results and 'files' in results:
    folder_id = results['files'][0]['id']
    print(f"Folder ID for '{folder_name}': {folder_id}")
else:
    print(f"Folder '{folder_name}' not found.")