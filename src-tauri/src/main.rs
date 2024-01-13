#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_fs_watch::init())
    .setup(|app| {
      let discord_ipc_client = DeclarativeDiscordIpcClient::new("1193591167087034481");
      discord_ipc_client.enable();

      let _ = discord_ipc_client.set_activity(activity::Activity::new()
        .state(&("Running MtLauncher ".to_owned() + &app.package_info().version.to_string()))
        .details("Loading...")
        .assets(activity::Assets::new().large_image("mtlauncher").large_text("MtLauncher"))
      );

      app.manage(discord_ipc_client);
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![open_minetest, download_and_unzip, download_file, set_activity, clear_activity])
    .run(tauri::generate_context!())
/*
    .run(|app_handle: tauri::AppHandle, event| match event {
      tauri::RunEvent::ExitRequested { } => {
        clear_activity(app_handle.state<DeclarativeDiscordIpcClient>());
      }
      _ => {}
    })
*/
    .expect("error while running tauri application");
}

use std::process::Command;

use std::path::Path;
use std::path::PathBuf;

use std::fs::File;
//use std::fs::metadata;

use std::{io, fs};
use std::io::prelude::*;

//use zip_extensions::*;

use declarative_discord_rich_presence::{activity,DeclarativeDiscordIpcClient};

use tauri::State;
use tauri::Manager;

#[tauri::command]
fn get_app_dir(app_handle: tauri::AppHandle) -> Option<PathBuf> {
  return app_handle.path_resolver().app_data_dir();
}

#[tauri::command]
async fn download_file(app_handle: tauri::AppHandle, url: String, target: String) -> bool{
  let app_dir = app_handle.path_resolver().app_data_dir().unwrap().into_os_string().into_string().to_owned().unwrap();
  let response = reqwest::get(&url).await.unwrap();
  let location = (app_dir.to_string() + &target).to_owned();

  let path = Path::new(&location);

  println!("{}", path.display());

  let mut file = match File::create(&path) {
    Err(why) => panic!("couldn't create {}", why),
    Ok(file) => file
  };

  let content = response.bytes().await.unwrap();
  let _ = file.write_all(content.as_ref());
  println!("done");

  return true;
}

#[tauri::command]
async fn download_and_unzip(app_handle: tauri::AppHandle, url: String, target: String)-> bool{
  // holy shjit this sucks
  println!("{}", url);
  println!("{}", target);

  let app_dir = app_handle.path_resolver().app_data_dir().unwrap().into_os_string().into_string().to_owned().unwrap();

  let response = reqwest::get(&url).await.unwrap();

  let zip_location = (app_dir.to_string() + "/tmp.zip").to_owned();
  println!("{}", zip_location);

  let path = Path::new(&zip_location);

  let mut file = match File::create(&path) {
    Err(why) => panic!("couldn't create {}", why),
    Ok(file) => file,
  };
  let content =  response.bytes().await.unwrap();
  let _ = file.write_all(content.as_ref());

  let zip_file1 = File::open(&path).unwrap();


  let _zip = zip::ZipArchive::new(zip_file1).unwrap();

  let final_location = app_dir.to_string() + &target;
  println!("{}", final_location);
  let _ = zip_extensions::read::zip_extract(
    &PathBuf::from(path),
    &PathBuf::from(final_location.clone()),
  );
  println!("checking for folders");

  let count = fs::read_dir(final_location.clone()).unwrap().count();
  println!("found {} folders", count);
  if count == 1 {
    for file in fs::read_dir(final_location.clone()).unwrap() {
      if fs::metadata(file.as_ref().unwrap().path()).unwrap().is_dir() {
        let _ = copy_dir_all(file.as_ref().unwrap().path(), final_location.clone());
        fs::remove_dir_all(file.as_ref().unwrap().path()).unwrap();
      }
    }
  }

  let _ = fs::remove_file(&path);

  println!("done");
  return true;
}

fn copy_dir_all(src: impl AsRef<Path>, dst: impl AsRef<Path>) -> io::Result<()> {
  fs::create_dir_all(&dst)?;
  for entry in fs::read_dir(src)? {
    let entry = entry?;
    let ty = entry.file_type()?;
    if ty.is_dir() {
      copy_dir_all(entry.path(), dst.as_ref().join(entry.file_name()))?;
    } else {
      fs::copy(entry.path(), dst.as_ref().join(entry.file_name()))?;
    }
  }
  Ok(())
}

#[tauri::command]
fn open_minetest(loc: String, content_dir: String, args: Vec<String>) {
  //TODO: can we pipe stdio/stderr back to the launcher?
  //this would be really handy for a lot of reasons
  //also this is really fucking insecure LOL
  let _ = Command::new(loc)
      .env("MINETEST_USER_PATH", content_dir)
      .args(args)
      .spawn();
}

#[tauri::command]
async fn set_activity(details: String, version: Option<String>, running_mt: Option<bool>, app_handle: tauri::AppHandle, discord_ipc_client: State<'_, DeclarativeDiscordIpcClient>) -> Result<(), ()> {
  let assets;
  if running_mt.is_some() && running_mt.unwrap() == true {
    assets = activity::Assets::new().small_image("mtlauncher").small_text(&("MtLauncher ".to_owned() + &app_handle.package_info().version.to_string())).large_image("minetest").large_text(&("Minetest ".to_owned() + &version.unwrap()));
  } else {
    assets = activity::Assets::new().large_image("mtlauncher").large_text(&("MtLauncher ".to_owned() + &app_handle.package_info().version.to_string()));
  }
  let _ = discord_ipc_client.set_activity(
    activity::Activity::new()
     .state(&("Running MtLauncher ".to_owned() + &app_handle.package_info().version.to_string()))
     .details(&details)
     .assets(assets)
  );
  Ok(())
}


#[tauri::command]
async fn clear_activity(discord_ipc_client: State<'_, DeclarativeDiscordIpcClient>) -> Result<(), ()> {
  let _ = discord_ipc_client.clear_activity();
  Ok(())
}