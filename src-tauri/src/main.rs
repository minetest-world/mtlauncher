#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

fn main() {
  tauri::Builder::default()
      .invoke_handler(tauri::generate_handler![open_minetest, download_and_unzip, download_file])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

use std::process::Command;

use std::path::Path;
use std::path::PathBuf;

use std::fs::File;
use std::fs::metadata;

use std::{io, fs};
use std::io::prelude::*;

use zip_extensions::*;

#[tauri::command]
fn get_app_dir(app_handle: tauri::AppHandle) -> Option<PathBuf> {
  return app_handle.path_resolver().app_dir();
}

#[tauri::command]
async fn download_file(app_handle: tauri::AppHandle, url: String, target: String) -> bool{
  let app_dir = app_handle.path_resolver().app_dir().unwrap().into_os_string().into_string().to_owned().unwrap();
  let response = reqwest::get(&url).await.unwrap();
  let mut location = (app_dir.to_string() + &target).to_owned();

  let path = Path::new(&location);

  println!("{}", path.display());

  let mut file = match File::create(&path) {
    Err(why) => panic!("couldn't create {}", why),
    Ok(file) => file
  };

  let content = response.bytes().await.unwrap();
  file.write_all(content.as_ref());
  println!("done");

  return true;
}

#[tauri::command]
async fn download_and_unzip(app_handle: tauri::AppHandle, url: String, target: String)-> bool{
  // holy shjit this sucks
  println!("{}", url);
  println!("{}", target);

  let app_dir = app_handle.path_resolver().app_dir().unwrap().into_os_string().into_string().to_owned().unwrap();

  let response = reqwest::get(&url).await.unwrap();

  let mut zip_location = (app_dir.to_string() + "/tmp.zip").to_owned();
  println!("{}", zip_location);

  let path = Path::new(&zip_location);

  let mut file = match File::create(&path) {
    Err(why) => panic!("couldn't create {}", why),
    Ok(file) => file,
  };
  let content =  response.bytes().await.unwrap();
  file.write_all(content.as_ref());

  let mut zip_file1 = File::open(&path).unwrap();


  let mut zip = zip::ZipArchive::new(zip_file1).unwrap();

  let mut final_location = app_dir.to_string() + &target;
  println!("{}", final_location);
  zip_extensions::read::zip_extract(
    &PathBuf::from(path),
    &PathBuf::from(final_location.clone()),
  );
  println!("checking for folders");

  let count = fs::read_dir(final_location.clone()).unwrap().count();
  println!("found {} folders", count);
  if count == 1 {
    for file in fs::read_dir(final_location.clone()).unwrap() {
      if fs::metadata(file.as_ref().unwrap().path()).unwrap().is_dir() {
        copy_dir_all(file.as_ref().unwrap().path(), final_location.clone());
        fs::remove_dir_all(file.as_ref().unwrap().path()).unwrap();
      }
    }
  }

  fs::remove_file(&path);

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
  Command::new(loc)
      .env("MINETEST_USER_PATH", content_dir)
      .args(args)
      .spawn();
}