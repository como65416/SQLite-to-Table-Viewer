(function() {
    var model = {
      sql : "CREATE TABLE table1 (a int, b char);\n" +
            "CREATE TABLE table2 (a int, bb char);\n" +
            "INSERT INTO table1 VALUES (0, 'hello');\n" +
            "INSERT INTO table1 VALUES (1, null);\n" +
            "INSERT INTO table2 VALUES (0, 'world');",
      table_datas : []
    };

    var editor_component = new Vue({
      el: '#app',
      data: function() {
        return {
            sql : model.sql,
            table_datas : model.table_datas
        }
      },
      methods: {
        excute: function () {
          try {
              let sql = window.SQL;
              let db = new sql.Database();
              db.run(this.sql);
              let stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table';");
              this.table_datas = [];
              while(stmt.step()) {
                let row = stmt.getAsObject();
                let table_name = row.name;
                let table_data = {
                    table_name : table_name,
                    columns : [],
                    rows : []
                };

                let stmt2 = db.prepare("PRAGMA table_info([" + table_name + "]);");
                while(stmt2.step()) {
                  let row2 = stmt2.getAsObject();
                  table_data.columns.push({name : row2.name, type : row2.type});
                }

                let stmt3 = db.prepare("select * from " + table_name);
                while(stmt3.step()) {
                  let row3 = stmt3.getAsObject();
                  table_data.rows.push(row3);
                }

                this.table_datas.push(table_data);
              }
          } catch (err) {
              alert(err.message);
          }
        }
      }
    });

    var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
      lineNumbers: true,
      matchBrackets: true,
      mode: "text/x-mysql"
    });
    editor.setOption("theme", "monokai");
    editor.on('change', function(cm) {
      editor_component.sql = cm.getValue();
    });
})();