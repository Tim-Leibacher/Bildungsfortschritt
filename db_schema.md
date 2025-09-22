```mermaid
%%{init: {'theme':'dark'}}%%

erDiagram
    User {
        int id PK
        string email
        string password
    }
    
    Rollen {
        int id PK
        string name
        int level
        string description
    }
    
    Module {
        int id PK
        string name
        string type
    }
    
    Kompetenzen {
        int id PK
        string name
        string description
        int required
    }
    
    User_Rollen {
        int user_id FK
        int rollen_id FK
        datetime assigned_date
    }
    
    User_Module {
        int user_id FK
        int module_id FK
        datetime completed_date
        string status
    }
    
    Module_Kompetenzen {
        int module_id FK
        int kompetenz_id FK
    }
    
    User ||--o{ User_Rollen : "hat"
    Rollen ||--o{ User_Rollen : "zugewiesen zu"
    
    User ||--o{ User_Module : "besucht"
    Module ||--o{ User_Module : "besucht von"
    
    Module ||--|{ Module_Kompetenzen : "hat"
    Kompetenzen ||--o{ Module_Kompetenzen : "gehört zu"
