using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;

namespace Backend.Database
{
  public class AppDbContext : DbContext
  {
   
    public string DbPath { get; }

    public AppDbContext()
    {
      var folder = Environment.SpecialFolder.LocalApplicationData;
      var path = Environment.GetFolderPath(folder);
      DbPath = System.IO.Path.Join(path, "AppDatabase.db");
    }

    // The following configures EF to create a Sqlite database file in the
    // special "local" folder for your platform.
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseSqlite($"Data Source={DbPath}");
  }
}
