import os
import pandas as pd
import json
import yaml
from werkzeug.utils import secure_filename
import logging

logger = logging.getLogger(__name__)

class DatasetService:
    """Service for handling dataset operations (CSV, JSON, YML)"""
    
    def __init__(self):
        self.upload_dir = 'uploads'
        self.allowed_extensions = {'csv', 'json', 'yml', 'yaml'}
    
    def _allowed_file(self, filename):
        """Check if file extension is allowed"""
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in self.allowed_extensions
    
    def _get_file_format(self, filename):
        """Get file format from extension"""
        ext = filename.rsplit('.', 1)[1].lower()
        if ext in ['yml', 'yaml']:
            return 'yml'
        return ext
    
    def parse_file(self, file, workspace_id):
        """Parse and save dataset file"""
        try:
            if not file or not self._allowed_file(file.filename):
                raise ValueError("Invalid file format. Supported: CSV, JSON, YML")
            
            # Secure filename and save
            filename = secure_filename(file.filename)
            workspace_path = os.path.join(self.upload_dir, f'workspace_{workspace_id}')
            os.makedirs(workspace_path, exist_ok=True)
            
            file_path = os.path.join(workspace_path, filename)
            file.save(file_path)
            
            # Parse file based on format
            file_format = self._get_file_format(filename)
            df = self._load_dataframe(file_path, file_format)
            
            # Get metadata
            row_count = len(df)
            column_count = len(df.columns)
            columns = df.columns.tolist()
            
            # Get column types and sample data
            column_info = []
            for col in columns:
                col_type = str(df[col].dtype)
                sample_values = df[col].head(3).tolist()
                null_count = df[col].isnull().sum()
                
                column_info.append({
                    'name': col,
                    'type': col_type,
                    'null_count': int(null_count),
                    'sample_values': sample_values
                })
            
            # Get preview data (first 10 rows)
            preview_data = df.head(10).to_dict('records')
            
            return {
                'success': True,
                'file_path': file_path,
                'file_format': file_format,
                'row_count': row_count,
                'column_count': column_count,
                'columns': columns,
                'column_info': column_info,
                'preview_data': preview_data,
                'file_size': os.path.getsize(file_path)
            }
        
        except Exception as e:
            logger.error(f"Error parsing file: {str(e)}")
            raise
    
    def _load_dataframe(self, file_path, file_format):
        """Load file into pandas DataFrame"""
        if file_format == 'csv':
            return pd.read_csv(file_path)
        elif file_format == 'json':
            return pd.read_json(file_path)
        elif file_format == 'yml':
            with open(file_path, 'r') as f:
                data = yaml.safe_load(f)
            # Handle different YAML structures
            if isinstance(data, list):
                return pd.DataFrame(data)
            elif isinstance(data, dict):
                # If dict has array values, use them
                for key, value in data.items():
                    if isinstance(value, list):
                        return pd.DataFrame(value)
                # Otherwise, convert dict to single-row DataFrame
                return pd.DataFrame([data])
            else:
                raise ValueError("Unsupported YAML structure")
        else:
            raise ValueError(f"Unsupported file format: {file_format}")
    
    def get_preview(self, file_path, rows=20):
        """Get preview of dataset"""
        try:
            file_format = self._get_file_format(file_path)
            df = self._load_dataframe(file_path, file_format)
            
            preview = {
                'columns': df.columns.tolist(),
                'data': df.head(rows).to_dict('records'),
                'total_rows': len(df),
                'dtypes': {col: str(dtype) for col, dtype in df.dtypes.items()}
            }
            
            return preview
        
        except Exception as e:
            logger.error(f"Error getting preview: {str(e)}")
            raise
    
    def get_statistics(self, file_path):
        """Get statistical summary of dataset"""
        try:
            file_format = self._get_file_format(file_path)
            df = self._load_dataframe(file_path, file_format)
            
            # Basic statistics
            stats = df.describe().to_dict()
            
            # Additional info
            info = {
                'total_rows': len(df),
                'total_columns': len(df.columns),
                'missing_values': df.isnull().sum().to_dict(),
                'data_types': {col: str(dtype) for col, dtype in df.dtypes.items()},
                'memory_usage': df.memory_usage(deep=True).sum()
            }
            
            return {
                'statistics': stats,
                'info': info
            }
        
        except Exception as e:
            logger.error(f"Error getting statistics: {str(e)}")
            raise
    
    def export_dataframe(self, file_path, output_format='csv'):
        """Export DataFrame to different format"""
        try:
            file_format = self._get_file_format(file_path)
            df = self._load_dataframe(file_path, file_format)
            
            output_path = file_path.replace(f'.{file_format}', f'_exported.{output_format}')
            
            if output_format == 'csv':
                df.to_csv(output_path, index=False)
            elif output_format == 'json':
                df.to_json(output_path, orient='records')
            elif output_format == 'xlsx':
                df.to_excel(output_path, index=False)
            else:
                raise ValueError(f"Unsupported output format: {output_format}")
            
            return {
                'success': True,
                'output_path': output_path
            }
        
        except Exception as e:
            logger.error(f"Error exporting dataframe: {str(e)}")
            raise
